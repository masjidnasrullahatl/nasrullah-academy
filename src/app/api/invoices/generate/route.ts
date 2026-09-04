import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { internalServerError, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { GenerateInvoicesSchema } from './types';

const getPreviousMonth = (year: number, month: number) => {
	if (month === 1) {
		return { year: year - 1, month: 12 };
	}

	return { year, month: month - 1 };
};

const generateInvoices = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = GenerateInvoicesSchema.parse(body);

		const prisma = createClient();

		const families = await prisma.families.findMany({
			where: {
				status: 'ACTIVE',
				students: {
					some: {
						status: 'ACTIVE',
						enrollments: {
							some: {
								status: 'ACTIVE',
								class: { status: 'ACTIVE', programId: data.programId },
							},
						},
					},
				},
			},
			include: {
				students: {
					where: { status: 'ACTIVE' },
					include: {
						enrollments: {
							select: { id: true },
							where: {
								status: 'ACTIVE',
								class: { status: 'ACTIVE', programId: data.programId },
							},
						},
					},
				},
			},
			orderBy: [{ name: 'asc' }],
		});

		if (!families.length) return success({ created: 0, skipped: 0 });

		const familyIds = families.map((family) => family.id);

		const existingInvoices = await prisma.monthlyInvoices.findMany({
			where: {
				year: data.year,
				month: data.month,
				familyId: { in: familyIds },
				programId: data.programId,
			},
			select: { familyId: true },
		});

		const existingFamilyIds = new Set(
			existingInvoices.map((invoice) => invoice.familyId),
		);

		let previousByFamily = new Map<
			string,
			{
				registrationFee: number;
				tuitionFee: number;
				bookFee: number;
			}
		>();

		if (data.copyFromPreviousMonth) {
			const previousMonth = getPreviousMonth(data.year, data.month);
			const previousInvoices = await prisma.monthlyInvoices.findMany({
				where: {
					year: previousMonth.year,
					month: previousMonth.month,
					familyId: { in: familyIds },
					programId: data.programId,
				},
				select: {
					familyId: true,
					registrationFee: true,
					tuitionFee: true,
					bookFee: true,
				},
			});

			previousByFamily = new Map(
				previousInvoices.map((invoice) => [
					invoice.familyId,
					{
						registrationFee: Number(invoice.registrationFee),
						tuitionFee: Number(invoice.tuitionFee),
						bookFee: Number(invoice.bookFee),
					},
				]),
			);
		}

		let created = 0;
		let skipped = 0;

		for (const family of families) {
			if (existingFamilyIds.has(family.id)) {
				skipped += 1;
				continue;
			}

			const studentCount = family.students.filter(
				(student) => student.enrollments.length > 0,
			).length;
			const previous = previousByFamily.get(family.id);

			await prisma.monthlyInvoices.create({
				data: {
					familyId: family.id,
					programId: data.programId,
					year: data.year,
					month: data.month,
					studentCount,
					registrationFee: previous?.registrationFee || 0,
					tuitionFee: previous?.tuitionFee || 0,
					bookFee: previous?.bookFee || 0,
					totalDue:
						(previous?.registrationFee || 0) +
						(previous?.tuitionFee || 0) +
						(previous?.bookFee || 0),
					paidRegistrationFee: 0,
					paidTuitionFee: 0,
					paidBookFee: 0,
					extraPaid: 0,
					totalPaid: 0,
					balance:
						(previous?.registrationFee || 0) +
						(previous?.tuitionFee || 0) +
						(previous?.bookFee || 0),
					payMethod: 'NA',
					paymentStatus: 'UNPAID',
					paidAt: null,
					notes: null,
				},
			});

			created += 1;
		}

		return success({ created, skipped });
	} catch (error) {
		console.log('Generate invoices error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const POST = withStaff(generateInvoices);
