import { NextResponse } from 'next/server';

import { PaymentStatus, PayMethod, Prisma, ProgramCode } from '@prisma/client';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

const MONTH_LABELS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

const toNumber = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

const getSummary = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);
	const year = Number(searchParams.get('year') || new Date().getFullYear());
	const programId = searchParams.get('programId') || '';

	const prisma = createClient();

	let programCode: ProgramCode | undefined;
	if (programId) {
		const program = await prisma.programs.findUnique({
			where: { id: programId },
			select: { code: true },
		});
		programCode = program?.code;
	}

	const invoiceWhere: Prisma.MonthlyInvoicesWhereInput = {
		year,
		...(programId ? { programId } : {}),
	};

	const enrollmentWhere: Prisma.EnrollmentsWhereInput = {
		status: 'ACTIVE',
		...(programId ? { programId } : {}),
		class: {
			schoolYear: year,
			status: 'ACTIVE',
		},
	};

	const classWhere: Prisma.ClassesWhereInput = {
		schoolYear: year,
		status: 'ACTIVE',
		...(programId ? { programId } : {}),
	};

	const [
		invoiceMonthly,
		invoiceUnpaidMonthly,
		activeEnrollments,
		activeTeachersCount,
		activeClassesCount,
		paymentStatusGroups,
		payMethodGroups,
		topUnpaidFamilyGroups,
	] = await prisma.$transaction([
		prisma.monthlyInvoices.groupBy({
			by: ['month'],
			orderBy: { month: 'asc' },
			where: invoiceWhere,
			_sum: {
				totalPaid: true,
				balance: true,
				studentCount: true,
			},
		}),
		prisma.monthlyInvoices.groupBy({
			by: ['month'],
			orderBy: { month: 'asc' },
			where: {
				...invoiceWhere,
				balance: { gt: 0 },
			},
			_sum: {
				balance: true,
			},
		}),
		prisma.enrollments.findMany({
			where: enrollmentWhere,
			select: {
				student: {
					select: {
						id: true,
						gender: true,
						familyId: true,
						status: true,
						family: {
							select: {
								status: true,
							},
						},
					},
				},
			},
		}),
		prisma.teachers.count({ where: { status: 'ACTIVE' } }),
		prisma.classes.count({ where: classWhere }),
		prisma.monthlyInvoices.groupBy({
			by: ['paymentStatus'],
			orderBy: { paymentStatus: 'asc' },
			where: invoiceWhere,
			_count: { _all: true },
			_sum: { totalDue: true },
		}),
		prisma.monthlyInvoices.groupBy({
			by: ['payMethod'],
			orderBy: { payMethod: 'asc' },
			where: invoiceWhere,
			_count: { _all: true },
			_sum: { totalDue: true },
		}),
		prisma.monthlyInvoices.groupBy({
			by: ['familyId'],
			where: {
				...invoiceWhere,
				balance: { gt: 0 },
			},
			_sum: { balance: true },
			orderBy: {
				_sum: { balance: 'desc' },
			},
			take: 10,
		}),
	]);

	const unpaidByMonth = new Map(
		invoiceUnpaidMonthly.map((item) => [item.month, toNumber(item._sum?.balance)]),
	);

	const monthlyMap = new Map(
		invoiceMonthly.map((item) => [
			item.month,
			{
				students: Number(item._sum?.studentCount || 0),
				income: toNumber(item._sum?.totalPaid),
				unpaidBalance: unpaidByMonth.get(item.month) || 0,
			},
		]),
	);

	const monthly = MONTH_LABELS.map((label, index) => {
		const month = index + 1;
		const invoiceMetrics = monthlyMap.get(month) || {
			students: 0,
			income: 0,
			unpaidBalance: 0,
		};

		return {
			month,
			label,
			students: invoiceMetrics.students,
			income: invoiceMetrics.income,
			unpaidBalance: invoiceMetrics.unpaidBalance,
		};
	});

	const uniqueStudents = new Map<string, { gender: 'BOY' | 'GIRL'; familyId: string }>();
	for (const enrollment of activeEnrollments) {
		const student = enrollment.student;
		if (student.status !== 'ACTIVE' || student.family.status !== 'ACTIVE') {
			continue;
		}
		if (!uniqueStudents.has(student.id)) {
			uniqueStudents.set(student.id, {
				gender: student.gender,
				familyId: student.familyId,
			});
		}
	}

	const students = uniqueStudents.size;
	const families = new Set(Array.from(uniqueStudents.values()).map((item) => item.familyId)).size;
	const boys = Array.from(uniqueStudents.values()).filter((item) => item.gender === 'BOY').length;
	const girls = students - boys;

	const totals = {
		students,
		families,
		boys,
		girls,
		teachers: activeTeachersCount,
		classes: activeClassesCount,
		income: monthly.reduce((sum, item) => sum + item.income, 0),
		unpaidBalance: monthly.reduce((sum, item) => sum + item.unpaidBalance, 0),
	};

	const genderSplit = { boys, girls };

	const paymentStatus = (
		[
			PaymentStatus.PAID,
			PaymentStatus.PARTIAL,
			PaymentStatus.UNPAID,
			PaymentStatus.NA,
		] as PaymentStatus[]
	).map((status) => {
		const found = paymentStatusGroups.find((item) => item.paymentStatus === status);
		return {
			status,
			count: Number((found as any)?._count?._all || 0),
			amount: toNumber(found?._sum?.totalDue),
		};
	});

	const payMethod = (
		[
			PayMethod.KEELA,
			PayMethod.ZELLE,
			PayMethod.CASH,
			PayMethod.CASHAPP,
			PayMethod.CHECK,
			PayMethod.FREE,
			PayMethod.OTHER,
			PayMethod.NA,
		] as PayMethod[]
	).map((method) => {
		const found = payMethodGroups.find((item) => item.payMethod === method);
		return {
			method,
			count: Number((found as any)?._count?._all || 0),
			amount: toNumber(found?._sum?.totalDue),
		};
	});

	const familyIds = topUnpaidFamilyGroups.map((item) => item.familyId);
	const familiesById = familyIds.length
		? await prisma.families.findMany({
				where: { id: { in: familyIds } },
				select: { id: true, name: true },
			})
		: [];
	const familyNameMap = new Map(familiesById.map((item) => [item.id, item.name]));

	const topUnpaidFamilies = topUnpaidFamilyGroups.map((item) => ({
		familyId: item.familyId,
		name: familyNameMap.get(item.familyId) || 'Unknown family',
		balance: toNumber(item._sum?.balance),
	}));

	return NextResponse.json({
		data: {
			totals,
			monthly,
			genderSplit,
			paymentStatus,
			payMethodSplit: payMethod,
			topUnpaidFamilies,
			programCode: programCode || null,
		},
		error: null,
	});
};

export const GET = withAuth(getSummary);
