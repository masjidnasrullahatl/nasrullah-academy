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

import { chargedFee } from '@utils/registrationPricing';

import { GenerateInvoicesSchema } from './types';

const getPreviousMonth = (year: number, month: number) => {
	if (month === 1) return { year: year - 1, month: 12 };

	return { year, month: month - 1 };
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

		const { count } = await prisma.monthlyInvoices.createMany({
			data: toCreate.map((item) => ({
				familyId: item.familyId,
				programId: item.programId,
				year: data.year,
				month: data.month,
				studentCount: item.studentCount,
				tuitionFee: chargedFee(Number(item.monthlyFee), Number(item.discount)),
				totalDue: chargedFee(Number(item.monthlyFee), Number(item.discount)),
				balance: chargedFee(Number(item.monthlyFee), Number(item.discount)),
				notes:
					Number(item.discount) > 0
						? `Discount ${Number(item.discount).toFixed(2)}${item.discountNote ? ` (${item.discountNote})` : ''}`
						: null,
				payMethod:
					previousPayMethods.get(`${item.familyId}:${item.programId}`) ||
					'NA',
				paymentStatus: 'UNPAID',
			})),
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
