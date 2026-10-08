import z, { ZodError } from 'zod/v4';

import {
	getTimesheets,
	ProgramHoursSchema,
	saveTimesheet,
} from '@app/api/timesheets/utils';
import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../utils';

const SaveTimesheetSchema = z.object({
	payPeriodId: z.string().min(1),
	hours: ProgramHoursSchema,
	submit: z.boolean().default(false),
});

// The signed-in teacher's hours for one pay period, by program
const getMyTimesheet = async (request: AuthRequest) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) return notFound('Teacher profile not found');

	const payPeriodId = new URL(request.url).searchParams.get('payPeriodId');

	if (!payPeriodId) return badRequest('Pay period is required');

	const prisma = createClient();

	const [row] = await getTimesheets(prisma, payPeriodId, teacher.id);

	return success({
		programs: row?.programs || [],
		totalHours: row?.totalHours || 0,
		submittedAt: row?.submittedAt || null,
	});
};

const saveMyTimesheet = async (request: AuthRequest) => {
	try {
		const teacher = await getCurrentTeacher(request.user.id);

		if (!teacher) return notFound('Teacher profile not found');

		const payload = SaveTimesheetSchema.parse(await request.json());

		const prisma = createClient();

		const [payPeriod, submission, assigned] = await Promise.all([
			prisma.payPeriods.findUnique({ where: { id: payload.payPeriodId } }),
			prisma.teacherSubmissions.findUnique({
				where: {
					teacherId_payPeriodId: {
						teacherId: teacher.id,
						payPeriodId: payload.payPeriodId,
					},
				},
			}),
			prisma.teacherPrograms.findMany({
				where: { teacherId: teacher.id },
				select: { programId: true },
			}),
		]);

		if (!payPeriod) return notFound('Pay period not found');

		if (payPeriod.status !== 'OPEN') {
			return badRequest('This pay period is closed');
		}

		if (submission) {
			return badRequest(
				'Hours already submitted. Ask the office to make corrections.',
			);
		}

		const assignedIds = new Set(assigned.map((item) => item.programId));

		if (payload.hours.some((item) => !assignedIds.has(item.programId))) {
			return badRequest('You can only enter hours for your programs');
		}

		if (payload.submit && !payload.hours.some((item) => item.hours > 0)) {
			return badRequest('Enter your hours before submitting');
		}

		await prisma.$transaction(async (tx) => {
			await saveTimesheet(tx, teacher.id, payPeriod, payload.hours);

			if (payload.submit) {
				await tx.teacherSubmissions.create({
					data: { teacherId: teacher.id, payPeriodId: payPeriod.id },
				});
			}
		});

		const [row] = await getTimesheets(prisma, payPeriod.id, teacher.id);

		return success(row);
	} catch (error) {
		console.log('Save my timesheet error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withAuth(getMyTimesheet);
export const PUT = withAuth(saveMyTimesheet);
