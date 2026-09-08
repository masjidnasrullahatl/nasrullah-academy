import z from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../utils';

const SubmitHoursSchema = z.object({
	payPeriodId: z.string().min(1),
});

const submitHours = async (request: AuthRequest) => {
	try {
		const teacher = await getCurrentTeacher(request.user.id);

		if (!teacher) return notFound('Teacher profile not found');

		const body = await request.json();
		const payload = SubmitHoursSchema.parse(body);

		const prisma = createClient();

		const payPeriodQuery = prisma.payPeriods.findUnique({
			where: { id: payload.payPeriodId },
		});

		const teacherSubmissionsQuery = prisma.teacherSubmissions.findUnique({
			where: {
				teacherId_payPeriodId: {
					teacherId: teacher.id,
					payPeriodId: payload.payPeriodId,
				},
			},
		});

		const timeEntriesQuery = prisma.timeEntries.count({
			where: {
				teacherId: teacher.id,
				payPeriodId: payload.payPeriodId,
			},
		});

		const [payPeriod, existingSubmission, entriesCount] = await Promise.all([
			payPeriodQuery,
			teacherSubmissionsQuery,
			timeEntriesQuery,
		]);

		if (!payPeriod) return notFound('Pay period not found');

		if (payPeriod.status !== 'OPEN') {
			return badRequest('Cannot submit hours. Pay period is not open');
		}

		if (existingSubmission) {
			return badRequest('Hours already submitted for this pay period');
		}

		if (!entriesCount) {
			return badRequest('No time entries found for this pay period');
		}

		const submission = await prisma.teacherSubmissions.create({
			data: {
				teacherId: teacher.id,
				payPeriodId: payload.payPeriodId,
			},
		});

		return success(submission);
	} catch (error) {
		console.log('Submit teacher hours error', error);
		return internalServerError();
	}
};

export const POST = withAuth(submitHours);
