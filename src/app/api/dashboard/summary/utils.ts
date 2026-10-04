import { Gender, PaymentStatus, PayMethod, Prisma } from '@prisma/client';

export const MONTH_LABELS = [
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

export const PAYMENT_STATUS_ORDER: PaymentStatus[] = [
	PaymentStatus.PAID,
	PaymentStatus.PARTIAL,
	PaymentStatus.UNPAID,
	PaymentStatus.NA,
];

export const PAY_METHOD_ORDER: PayMethod[] = [
	PayMethod.KEELA,
	PayMethod.ZELLE,
	PayMethod.CASH,
	PayMethod.CASHAPP,
	PayMethod.CARD,
	PayMethod.SQUARE,
	PayMethod.CHECK,
	PayMethod.FREE,
	PayMethod.OTHER,
	PayMethod.NA,
];

export const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
	Number(value ?? 0);

type ExpenseEntry = {
	date: Date;
	hours: Prisma.Decimal;
	classId: string;
	teacher: { hourlyRate: Prisma.Decimal | null };
	class: { programId: string };
};

type EnrollmentRow = {
	classId: string;
	class: { programId: string };
	student: { id: string; gender: Gender; familyId: string };
};

type StudentProgramRow = {
	programId: string;
	student: { id: string; gender: Gender; familyId: string };
};

type MilestoneSummaryRow = {
	type: 'JUZ' | 'BOOK';
	completedAt: Date;
	studentId: string;
};

type ClassRow = {
	id: string;
	name: string;
	programId: string;
	program: { name: string };
};

type MonthlyInvoiceGroup = {
	month: number;
	_sum: { totalPaid: Prisma.Decimal | null; studentCount: number | null };
};

type ProgramRow = { id: string; name: string };

type EnumBreakdownRow<V extends string> = {
	value: V;
	count: number;
	amount: number;
};

export const aggregateExpenses = (entries: ExpenseEntry[]) => {
	const byMonth = new Map<number, number>();
	const byClass = new Map<string, number>();
	const byProgram = new Map<string, number>();

	for (const entry of entries) {
		const month = entry.date.getMonth() + 1;
		const expense = toNumber(entry.hours) * toNumber(entry.teacher.hourlyRate);

		byMonth.set(month, (byMonth.get(month) || 0) + expense);
		byClass.set(entry.classId, (byClass.get(entry.classId) || 0) + expense);
		byProgram.set(
			entry.class.programId,
			(byProgram.get(entry.class.programId) || 0) + expense,
		);
	}

	return { byMonth, byClass, byProgram };
};

export const countEnrollmentsByClass = (enrollments: EnrollmentRow[]) => {
	const countByClass = new Map<string, number>();

	for (const enrollment of enrollments) {
		countByClass.set(
			enrollment.classId,
			(countByClass.get(enrollment.classId) || 0) + 1,
		);
	}

	return countByClass;
};

export const aggregateStudentPrograms = (rows: StudentProgramRow[]) => {
	const uniqueStudents = new Map<
		string,
		{ gender: Gender; familyId: string }
	>();

	const studentIdsByProgram = new Map<string, Set<string>>();

	for (const row of rows) {
		uniqueStudents.set(row.student.id, {
			gender: row.student.gender,
			familyId: row.student.familyId,
		});

		if (!studentIdsByProgram.has(row.programId)) {
			studentIdsByProgram.set(row.programId, new Set<string>());
		}
		studentIdsByProgram.get(row.programId)?.add(row.student.id);
	}

	const values = Array.from(uniqueStudents.values());
	const students = values.length;
	const families = new Set(values.map((item) => item.familyId)).size;
	const boys = values.filter((item) => item.gender === Gender.BOY).length;
	const girls = students - boys;

	return { students, families, boys, girls, studentIdsByProgram };
};

export const aggregateClasses = (
	classes: ClassRow[],
	countByClass: Map<string, number>,
) => {
	const enrollmentsByProgram = new Map<string, number>();
	const classesByProgram = new Map<string, number>();

	for (const classItem of classes) {
		enrollmentsByProgram.set(
			classItem.programId,
			(enrollmentsByProgram.get(classItem.programId) || 0) +
				(countByClass.get(classItem.id) || 0),
		);
		classesByProgram.set(
			classItem.programId,
			(classesByProgram.get(classItem.programId) || 0) + 1,
		);
	}

	return { enrollmentsByProgram, classesByProgram };
};

export const buildMonthly = (
	invoiceMonthly: MonthlyInvoiceGroup[],
	unpaidByMonth: Map<number, number>,
	expenseByMonth: Map<number, number>,
) => {
	const byMonth = new Map(
		invoiceMonthly.map((item) => [
			item.month,
			{
				students: Number(item._sum.studentCount || 0),
				income: toNumber(item._sum.totalPaid),
			},
		]),
	);

	return MONTH_LABELS.map((label, index) => {
		const month = index + 1;
		const metrics = byMonth.get(month);
		const income = metrics?.income ?? 0;
		const expense = expenseByMonth.get(month) || 0;

		return {
			month,
			label,
			students: metrics?.students ?? 0,
			income,
			expense,
			profit: income - expense,
			unpaidBalance: unpaidByMonth.get(month) || 0,
		};
	});
};

export const buildClassProfitLoss = (
	classes: ClassRow[],
	countByClass: Map<string, number>,
	enrollmentsByProgram: Map<string, number>,
	programRevenueMap: Map<string, number>,
	expenseByClass: Map<string, number>,
) =>
	classes
		.map((classItem) => {
			const enrollmentCount = countByClass.get(classItem.id) || 0;

			const totalProgramEnrollments =
				enrollmentsByProgram.get(classItem.programId) || 0;

			const programRevenue = programRevenueMap.get(classItem.programId) || 0;

			const revenue =
				totalProgramEnrollments > 0
					? (programRevenue * enrollmentCount) / totalProgramEnrollments
					: 0;

			const expense = expenseByClass.get(classItem.id) || 0;

			return {
				classId: classItem.id,
				className: classItem.name,
				programName: classItem.program.name,
				enrollmentCount,
				revenue,
				expense,
				profit: revenue - expense,
			};
		})
		.sort((a, b) => {
			if (a.programName !== b.programName) {
				return a.programName.localeCompare(b.programName);
			}

			return a.className.localeCompare(b.className);
		});

export const buildProgramSummary = (
	programs: ProgramRow[],
	studentIdsByProgram: Map<string, Set<string>>,
	classesByProgram: Map<string, number>,
	programRevenueMap: Map<string, number>,
	expenseByProgram: Map<string, number>,
) =>
	programs.map((program) => {
		const income = programRevenueMap.get(program.id) || 0;
		const expense = expenseByProgram.get(program.id) || 0;

		return {
			programId: program.id,
			programName: program.name,
			students: studentIdsByProgram.get(program.id)?.size || 0,
			classes: classesByProgram.get(program.id) || 0,
			income,
			expense,
			profit: income - expense,
		};
	});

export const buildEnumBreakdown = <K extends string, V extends string>(
	keyName: K,
	order: V[],
	rows: EnumBreakdownRow<V>[],
) =>
	order.map((value) => {
		const found = rows.find((row) => row.value === value);

		return {
			[keyName]: value,
			count: found?.count ?? 0,
			amount: found?.amount ?? 0,
		};
	});

export const buildMilestoneSummary = (rows: MilestoneSummaryRow[]) => {
	const monthly = MONTH_LABELS.map((label, index) => ({
		month: index + 1,
		label,
		juz: 0,
		books: 0,
	}));

	for (const row of rows) {
		const item = monthly[row.completedAt.getUTCMonth()];

		if (row.type === 'JUZ') item.juz += 1;
		else item.books += 1;
	}

	return {
		monthly,
		totals: {
			juz: rows.filter((row) => row.type === 'JUZ').length,
			books: rows.filter((row) => row.type === 'BOOK').length,
			students: new Set(rows.map((row) => row.studentId)).size,
		},
	};
};
