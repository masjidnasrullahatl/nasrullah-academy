import { createClient } from '@helpers/prisma/server';

type Prisma = ReturnType<typeof createClient>;

const getPreviousMonth = (year: number, month: number) => {
	if (month === 1) return { year: year - 1, month: 12 };

	return { year, month: month - 1 };
};

/**
 * family:program pairs whose active students are all on a scholarship for
 * this month, so nothing is due. A family with another child in the program
 * pays as usual; its monthly fee already leaves the scholarship child out.
 */
const getFullyCovered = async (
	prisma: Prisma,
	year: number,
	month: number,
) => {
	const monthStart = new Date(Date.UTC(year, month - 1, 1));

	const scholarships = await prisma.scholarships.findMany({
		where: {
			startMonth: { lte: monthStart },
			OR: [{ endMonth: null }, { endMonth: { gte: monthStart } }],
		},
		select: { studentId: true, student: { select: { familyId: true } } },
	});

	const coveredIds = new Set(scholarships.map((item) => item.studentId));

	const students = await prisma.students.findMany({
		where: {
			status: 'ACTIVE',
			familyId: { in: scholarships.map((item) => item.student.familyId) },
		},
		select: {
			id: true,
			familyId: true,
			programs: { select: { programId: true } },
		},
	});

	const covered = new Set<string>();
	const notCovered = new Set<string>();

	for (const student of students) {
		for (const { programId } of student.programs) {
			(coveredIds.has(student.id) ? covered : notCovered).add(
				`${student.familyId}:${programId}`,
			);
		}
	}

	return new Set([...covered].filter((key) => !notCovered.has(key)));
};

/**
 * Makes sure a month has a payment row for every active family: an unpaid
 * row at the family's monthly fee (or $0 when a scholarship covers it).
 * Rows already there, such as card payments, are left as they are, so it is
 * safe to run as often as needed.
 */
export const generateMonth = async (
	prisma: Prisma,
	year: number,
	month: number,
	programId?: string | null,
) => {
	const data = { year, month, programId };

	// Card payments create their family's row as they come in, so a month
	// can already have some rows: only the families without one are added
	const familyPrograms = await prisma.familyPrograms.findMany({
		where: {
			...(data.programId ? { programId: data.programId } : {}),
			family: { status: 'ACTIVE' },
			program: { status: 'ACTIVE' },
		},
	});

	if (!familyPrograms.length) return { created: 0, skipped: 0 };

	const existingInvoices = await prisma.monthlyInvoices.findMany({
		where: {
			year: data.year,
			month: data.month,
			...(data.programId ? { programId: data.programId } : {}),
		},
		select: { familyId: true, programId: true },
	});

	const existingKeys = new Set(
		existingInvoices.map((invoice) => `${invoice.familyId}:${invoice.programId}`),
	);

	const previousMonth = getPreviousMonth(data.year, data.month);

	const previousInvoices = await prisma.monthlyInvoices.findMany({
		where: {
			year: previousMonth.year,
			month: previousMonth.month,
			payMethod: { not: 'NA' },
			...(data.programId ? { programId: data.programId } : {}),
		},
		select: { familyId: true, programId: true, payMethod: true },
	});

	const previousPayMethods = new Map(
		previousInvoices.map((invoice) => [
			`${invoice.familyId}:${invoice.programId}`,
			invoice.payMethod,
		]),
	);

	const toCreate = familyPrograms.filter(
		(item) => !existingKeys.has(`${item.familyId}:${item.programId}`),
	);

	const fullyCovered = await getFullyCovered(prisma, data.year, data.month);

	const { count } = await prisma.monthlyInvoices.createMany({
		data: toCreate.map((item) => {
			const key = `${item.familyId}:${item.programId}`;
			const base = {
				familyId: item.familyId,
				programId: item.programId,
				year: data.year,
				month: data.month,
				studentCount: item.studentCount,
			};

			if (fullyCovered.has(key)) {
				return {
					...base,
					payMethod: 'FREE' as const,
					paymentStatus: 'NA' as const,
					notes: 'Scholarship: no fee due this month.',
				};
			}

			return {
				...base,
				tuitionFee: item.monthlyFee,
				totalDue: item.monthlyFee,
				balance: item.monthlyFee,
				payMethod: previousPayMethods.get(key) || ('NA' as const),
				paymentStatus: 'UNPAID' as const,
			};
		}),
		skipDuplicates: true,
	});

	return { created: count, skipped: familyPrograms.length - count };
};
