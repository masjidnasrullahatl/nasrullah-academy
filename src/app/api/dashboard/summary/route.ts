import { PaymentStatus, PayMethod, Prisma } from '@prisma/client';

import { AuthRequest } from '@app/api/types/common';
import { success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

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

const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
	Number(value ?? 0);

const getSummary = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);
	const year = Number(searchParams.get('year') || new Date().getFullYear());
	const programId = searchParams.get('programId') || '';

	const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
	const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

	const prisma = createClient();

	const invoiceWhere: Prisma.MonthlyInvoicesWhereInput = { year };
	if (programId) {
		invoiceWhere.programId = programId;
	}

	const classWhere: Prisma.ClassesWhereInput = {
		status: 'ACTIVE',
		...(programId ? { programId } : {}),
	};

	const enrollmentWhere: Prisma.EnrollmentsWhereInput = {
		status: 'ACTIVE',
		class: classWhere,
	};

	const expenseEntriesWhere: Prisma.TimeEntriesWhereInput = {
		date: { gte: yearStart, lte: yearEnd },
		payPeriod: {
			status: { in: ['LOCKED', 'PAID'] },
		},
		class: {
			...(programId ? { programId } : {}),
		},
	};

	const [
		invoiceMonthly,
		invoiceUnpaidMonthly,
		activeEnrollments,
		activeTeachersCount,
		activeClasses,
		paymentStatusGroups,
		payMethodGroups,
		topUnpaidFamilyGroups,
		programRevenueGroups,
		expenseEntries,
		payRecordsExpense,
		programs,
	] = await prisma.$transaction([
		prisma.monthlyInvoices.groupBy({
			by: ['month'],
			orderBy: { month: 'asc' },
			where: invoiceWhere,
			_sum: { totalPaid: true, balance: true, studentCount: true },
		}),
		prisma.monthlyInvoices.groupBy({
			by: ['month'],
			orderBy: { month: 'asc' },
			where: {
				...invoiceWhere,
				balance: { gt: 0 },
			},
			_sum: { balance: true },
		}),
		prisma.enrollments.findMany({
			where: enrollmentWhere,
			select: {
				classId: true,
				class: {
					select: {
						programId: true,
					},
				},
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
		prisma.classes.findMany({
			where: classWhere,
			select: {
				id: true,
				name: true,
				programId: true,
				teacher: {
					select: {
						hourlyRate: true,
					},
				},
				program: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: [{ program: { name: 'asc' } }, { name: 'asc' }],
		}),
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
		prisma.monthlyInvoices.groupBy({
			by: ['programId'],
			orderBy: { programId: 'asc' },
			where: invoiceWhere,
			_sum: { totalPaid: true },
		}),
		prisma.timeEntries.findMany({
			where: expenseEntriesWhere,
			select: {
				date: true,
				hours: true,
				classId: true,
				teacher: {
					select: {
						hourlyRate: true,
					},
				},
				class: {
					select: {
						programId: true,
					},
				},
			},
		}),
		prisma.payRecords.aggregate({
			where: {
				payPeriod: {
					status: { in: ['LOCKED', 'PAID'] },
					endDate: {
						gte: yearStart,
						lte: yearEnd,
					},
				},
			},
			_sum: {
				totalPay: true,
			},
		}),
		prisma.programs.findMany({
			where: programId
				? { id: programId }
				: {
					status: 'ACTIVE',
				},
			select: {
				id: true,
				name: true,
			},
			orderBy: {
				name: 'asc',
			},
		}),
	]);

	const unpaidByMonth = new Map(
		invoiceUnpaidMonthly.map((item) => [item.month, toNumber(item._sum?.balance)]),
	);

	const programRevenueMap = new Map(
		programRevenueGroups.map((item) => [item.programId, toNumber(item._sum?.totalPaid)]),
	);

	const expenseByMonth = new Map<number, number>();
	const expenseByClass = new Map<string, number>();

	for (const entry of expenseEntries) {
		const month = entry.date.getMonth() + 1;
		const expense = toNumber(entry.hours) * toNumber(entry.teacher.hourlyRate);

		expenseByMonth.set(month, (expenseByMonth.get(month) || 0) + expense);
		expenseByClass.set(entry.classId, (expenseByClass.get(entry.classId) || 0) + expense);
	}

	const monthlyMap = new Map(
		invoiceMonthly.map((item) => [
			item.month,
			{
				students: Number(item._sum?.studentCount || 0),
				income: toNumber(item._sum?.totalPaid),
				unpaidBalance: unpaidByMonth.get(item.month) || 0,
				expense: expenseByMonth.get(item.month) || 0,
			},
		]),
	);

	const monthly = MONTH_LABELS.map((label, index) => {
		const month = index + 1;
		const metrics = monthlyMap.get(month) || {
			students: 0,
			income: 0,
			unpaidBalance: 0,
			expense: expenseByMonth.get(month) || 0,
		};

		return {
			month,
			label,
			students: metrics.students,
			income: metrics.income,
			expense: metrics.expense,
			profit: metrics.income - metrics.expense,
			unpaidBalance: metrics.unpaidBalance,
		};
	});

	const validEnrollments = activeEnrollments.filter(
		(item) =>
			item.student.status === 'ACTIVE' &&
			item.student.family.status === 'ACTIVE',
	);

	const uniqueStudents = new Map<string, { gender: 'BOY' | 'GIRL'; familyId: string }>();
	for (const enrollment of validEnrollments) {
		if (!uniqueStudents.has(enrollment.student.id)) {
			uniqueStudents.set(enrollment.student.id, {
				gender: enrollment.student.gender,
				familyId: enrollment.student.familyId,
			});
		}
	}

	const students = uniqueStudents.size;
	const families = new Set(
		Array.from(uniqueStudents.values()).map((item) => item.familyId),
	).size;
	const boys = Array.from(uniqueStudents.values()).filter(
		(item) => item.gender === 'BOY',
	).length;
	const girls = students - boys;

	const enrollmentCountByClass = new Map<string, number>();
	const studentIdsByProgram = new Map<string, Set<string>>();

	for (const enrollment of validEnrollments) {
		enrollmentCountByClass.set(
			enrollment.classId,
			(enrollmentCountByClass.get(enrollment.classId) || 0) + 1,
		);

		if (!studentIdsByProgram.has(enrollment.class.programId)) {
			studentIdsByProgram.set(enrollment.class.programId, new Set<string>());
		}
		studentIdsByProgram.get(enrollment.class.programId)?.add(enrollment.student.id);
	}

	const totalEnrollmentsByProgram = new Map<string, number>();
	for (const classItem of activeClasses) {
		const enrollmentCount = enrollmentCountByClass.get(classItem.id) || 0;
		totalEnrollmentsByProgram.set(
			classItem.programId,
			(totalEnrollmentsByProgram.get(classItem.programId) || 0) + enrollmentCount,
		);
	}

	const classProfitLoss = activeClasses
		.map((classItem) => {
			const enrollmentCount = enrollmentCountByClass.get(classItem.id) || 0;
			const totalProgramEnrollments =
				totalEnrollmentsByProgram.get(classItem.programId) || 0;
			const programRevenue = programRevenueMap.get(classItem.programId) || 0;
			const revenue =
				totalProgramEnrollments > 0
					? (programRevenue * enrollmentCount) / totalProgramEnrollments
					: 0;
			const expense = expenseByClass.get(classItem.id) || 0;
			const profit = revenue - expense;

			return {
				classId: classItem.id,
				className: classItem.name,
				programName: classItem.program.name,
				enrollmentCount,
				revenue,
				expense,
				profit,
			};
		})
		.sort((a, b) => {
			if (a.programName !== b.programName) {
				return a.programName.localeCompare(b.programName);
			}

			return a.className.localeCompare(b.className);
		});

	const expenseByProgram = new Map<string, number>();
	for (const classItem of activeClasses) {
		expenseByProgram.set(
			classItem.programId,
			(expenseByProgram.get(classItem.programId) || 0) +
				(expenseByClass.get(classItem.id) || 0),
		);
	}

	const classesCountByProgram = new Map<string, number>();
	for (const classItem of activeClasses) {
		classesCountByProgram.set(
			classItem.programId,
			(classesCountByProgram.get(classItem.programId) || 0) + 1,
		);
	}

	const programSummary = programs.map((program) => {
		const income = programRevenueMap.get(program.id) || 0;
		const expense = expenseByProgram.get(program.id) || 0;

		return {
			programId: program.id,
			programName: program.name,
			students: studentIdsByProgram.get(program.id)?.size || 0,
			classes: classesCountByProgram.get(program.id) || 0,
			income,
			expense,
			profit: income - expense,
		};
	});

	const totalsIncome = monthly.reduce((sum, item) => sum + item.income, 0);
	const totalsUnpaidBalance = monthly.reduce(
		(sum, item) => sum + item.unpaidBalance,
		0,
	);
	const totalsExpense = programId
		? monthly.reduce((sum, item) => sum + item.expense, 0)
		: toNumber(payRecordsExpense._sum.totalPay);

	const totals = {
		students,
		families,
		boys,
		girls,
		teachers: activeTeachersCount,
		classes: activeClasses.length,
		income: totalsIncome,
		unpaidBalance: totalsUnpaidBalance,
		expense: totalsExpense,
		profit: totalsIncome - totalsExpense,
	};

	const paymentStatus = (
		[
			PaymentStatus.PAID,
			PaymentStatus.PARTIAL,
			PaymentStatus.UNPAID,
			PaymentStatus.NA,
		] as PaymentStatus[]
	).map((status) => {
		const found = paymentStatusGroups.find(
			(item) => item.paymentStatus === status,
		);
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
			PayMethod.SQUARE,
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

	return success({
		totals,
		monthly,
		genderSplit: { boys, girls },
		paymentStatus,
		payMethodSplit: payMethod,
		topUnpaidFamilies,
		classProfitLoss,
		programSummary,
	});
};

export const GET = withStaff(getSummary);
