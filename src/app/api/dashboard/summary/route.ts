import { Prisma } from '@prisma/client';

import { AuthRequest } from '@app/api/types/common';
import { success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import {
	aggregateClasses,
	aggregateEnrollments,
	aggregateExpenses,
	buildClassProfitLoss,
	buildEnumBreakdown,
	buildMonthly,
	buildProgramSummary,
	PAY_METHOD_ORDER,
	PAYMENT_STATUS_ORDER,
	toNumber,
} from './utils';

const getSummary = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const year = Number(searchParams.get('year') || new Date().getFullYear());
	const programId = searchParams.get('programId') || '';

	const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
	const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

	const prisma = createClient();

	const invoiceWhere: Prisma.MonthlyInvoicesWhereInput = { year };

	if (programId) invoiceWhere.programId = programId;

	const classWhere: Prisma.ClassesWhereInput = {
		status: 'ACTIVE',
		...(programId ? { programId } : {}),
	};

	const enrollmentWhere: Prisma.EnrollmentsWhereInput = {
		status: 'ACTIVE',
		class: classWhere,
		student: { status: 'ACTIVE', family: { status: 'ACTIVE' } },
	};

	const expenseEntriesWhere: Prisma.TimeEntriesWhereInput = {
		date: { gte: yearStart, lte: yearEnd },
		payPeriod: { status: { in: ['LOCKED', 'PAID'] } },
		...(programId ? { class: { programId } } : {}),
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
		programs,
	] = await Promise.all([
		prisma.monthlyInvoices.groupBy({
			by: ['month'],
			orderBy: { month: 'asc' },
			where: invoiceWhere,
			_sum: { totalPaid: true, balance: true, studentCount: true },
		}),
		prisma.monthlyInvoices.groupBy({
			by: ['month'],
			orderBy: { month: 'asc' },
			where: { ...invoiceWhere, balance: { gt: 0 } },
			_sum: { balance: true },
		}),
		prisma.enrollments.findMany({
			where: enrollmentWhere,
			select: {
				classId: true,
				class: { select: { programId: true } },
				student: { select: { id: true, gender: true, familyId: true } },
			},
		}),
		prisma.teachers.count({ where: { status: 'ACTIVE' } }),
		prisma.classes.findMany({
			where: classWhere,
			select: {
				id: true,
				name: true,
				programId: true,
				program: { select: { id: true, name: true } },
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
			where: { ...invoiceWhere, balance: { gt: 0 } },
			_sum: { balance: true },
			orderBy: { _sum: { balance: 'desc' } },
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
				teacher: { select: { hourlyRate: true } },
				class: { select: { programId: true } },
			},
		}),
		prisma.programs.findMany({
			where: programId ? { id: programId } : { status: 'ACTIVE' },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	]);

	const unpaidByMonth = new Map(
		invoiceUnpaidMonthly.map((item) => [
			item.month,
			toNumber(item._sum?.balance),
		]),
	);

	const programRevenueMap = new Map(
		programRevenueGroups.map((item) => [
			item.programId,
			toNumber(item._sum?.totalPaid),
		]),
	);

	const {
		byMonth: expenseByMonth,
		byClass: expenseByClass,
		byProgram: expenseByProgram,
	} = aggregateExpenses(expenseEntries);

	const { students, families, boys, girls, countByClass, studentIdsByProgram } =
		aggregateEnrollments(activeEnrollments);

	const { enrollmentsByProgram, classesByProgram } = aggregateClasses(
		activeClasses,
		countByClass,
	);

	const monthly = buildMonthly(invoiceMonthly, unpaidByMonth, expenseByMonth);

	const classProfitLoss = buildClassProfitLoss(
		activeClasses,
		countByClass,
		enrollmentsByProgram,
		programRevenueMap,
		expenseByClass,
	);

	const programSummary = buildProgramSummary(
		programs,
		studentIdsByProgram,
		classesByProgram,
		programRevenueMap,
		expenseByProgram,
	);

	const totalsIncome = monthly.reduce((sum, item) => sum + item.income, 0);
	const totalsUnpaidBalance = monthly.reduce(
		(sum, item) => sum + item.unpaidBalance,
		0,
	);
	const totalsExpense = monthly.reduce((sum, item) => sum + item.expense, 0);

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

	const paymentStatus = buildEnumBreakdown(
		'status',
		PAYMENT_STATUS_ORDER,
		paymentStatusGroups.map((group) => ({
			value: group.paymentStatus,
			count: group._count._all,
			amount: toNumber(group._sum?.totalDue),
		})),
	);

	const payMethod = buildEnumBreakdown(
		'method',
		PAY_METHOD_ORDER,
		payMethodGroups.map((group) => ({
			value: group.payMethod,
			count: group._count._all,
			amount: toNumber(group._sum?.totalDue),
		})),
	);

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
