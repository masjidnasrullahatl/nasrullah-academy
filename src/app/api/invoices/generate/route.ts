import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { GenerateInvoicesSchema } from './types';

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
	prisma: ReturnType<typeof createClient>,
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

const generateInvoices = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = GenerateInvoicesSchema.parse(body);

		const prisma = createClient();

		const alreadyGenerated = await prisma.monthlyInvoices.count({
			where: {
				year: data.year,
				month: data.month,
				...(data.programId ? { programId: data.programId } : {}),
			},
		});

		if (alreadyGenerated) {
			return badRequest(
				'This month has already been generated. Use "Add payment row" for any family that is missing.',
			);
		}

		const familyPrograms = await prisma.familyPrograms.findMany({
			where: {
				...(data.programId ? { programId: data.programId } : {}),
				family: { status: 'ACTIVE' },
				program: { status: 'ACTIVE' },
			},
		});

		if (!familyPrograms.length) return success({ created: 0, skipped: 0 });

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

		return success({
			created: count,
			skipped: familyPrograms.length - count,
		});
	} catch (error) {
		console.log('Generate invoices error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const POST = withStaff(generateInvoices);
