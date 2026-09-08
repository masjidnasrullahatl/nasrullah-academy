import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import sumBy from 'lodash/sumBy';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { GeneratePayResponse } from './types';

const generatePay = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;

		const prisma = createClient();

		const payPeriod = await prisma.payPeriods.findUnique({ where: { id } });

		if (!payPeriod) return notFound('Pay period not found');

		if (payPeriod.status !== 'OPEN') return badRequest('Already generated');

		const timeEntryGroups = await prisma.timeEntries.groupBy({
			by: ['teacherId'],
			where: { payPeriodId: id },
			_sum: { hours: true },
		});

		const teacherIds = map(timeEntryGroups, 'teacherId');

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

		const teacherById = keyBy(teachers, 'id');

		const records = await prisma.$transaction(async (tx) => {
			await tx.payRecords.deleteMany({ where: { payPeriodId: id } });

			const createdRecords: Array<GeneratePayResponse> = [];

			for (const group of timeEntryGroups) {
				const teacher = teacherById[group.teacherId];

				if (!teacher) continue;

				const totalHours = Number(group._sum.hours || 0);
				const hourlyRate = Number(teacher.hourlyRate || 0);
				const totalPay = totalHours * hourlyRate;

				const payload = {
					teacherId: teacher.id,
					totalHours,
					hourlyRate,
					totalPay,
				};

				await tx.payRecords.create({
					data: { payPeriodId: id, ...payload },
				});

				createdRecords.push({
					teacherName: `${teacher.firstName} ${teacher.lastName}`,
					...payload,
				});
			}

			await tx.payPeriods.update({
				where: { id },
				data: { status: 'LOCKED' },
			});

			return createdRecords;
		});

		const totalExpense = sumBy(records, 'totalPay');

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
