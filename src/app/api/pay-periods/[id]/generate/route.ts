import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

const generatePay = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const prisma = createClient();

		const payPeriod = await prisma.payPeriods.findUnique({ where: { id } });
		if (!payPeriod) {
			return notFound('Pay period not found');
		}

		if (payPeriod.status !== 'OPEN') {
			return badRequest('Already generated');
		}

		const timeEntryGroups = await prisma.timeEntries.groupBy({
			by: ['teacherId'],
			where: {
				payPeriodId: id,
			},
			_sum: {
				hours: true,
			},
		});

		const teacherIds = timeEntryGroups.map((item) => item.teacherId);
		const teachers = teacherIds.length
			? await prisma.teachers.findMany({
					where: { id: { in: teacherIds } },
					select: {
						id: true,
						firstName: true,
						lastName: true,
						hourlyRate: true,
					},
				})
			: [];

		const teacherById = new Map(teachers.map((teacher) => [teacher.id, teacher]));

		const records = await prisma.$transaction(async (tx) => {
			await tx.payRecords.deleteMany({ where: { payPeriodId: id } });

			const createdRecords: Array<{
				teacherId: string;
				teacherName: string;
				totalHours: number;
				hourlyRate: number;
				totalPay: number;
			}> = [];

			for (const group of timeEntryGroups) {
				const teacher = teacherById.get(group.teacherId);
				if (!teacher) {
					continue;
				}

				const totalHours = Number(group._sum.hours || 0);
				const hourlyRate = Number(teacher.hourlyRate || 0);
				const totalPay = totalHours * hourlyRate;

				await tx.payRecords.create({
					data: {
						teacherId: teacher.id,
						payPeriodId: id,
						totalHours,
						hourlyRate,
						totalPay,
					},
				});

				createdRecords.push({
					teacherId: teacher.id,
					teacherName: `${teacher.firstName} ${teacher.lastName}`,
					totalHours,
					hourlyRate,
					totalPay,
				});
			}

			await tx.payPeriods.update({
				where: { id },
				data: {
					status: 'LOCKED',
				},
			});

			return createdRecords;
		});

		const totalExpense = records.reduce((sum, item) => sum + item.totalPay, 0);

		return success({
			periodId: id,
			status: 'LOCKED',
			records,
			totalExpense,
		});
	} catch (error) {
		console.log('Generate pay error', error);
		return internalServerError();
	}
};

export const POST = withStaff(generatePay);
