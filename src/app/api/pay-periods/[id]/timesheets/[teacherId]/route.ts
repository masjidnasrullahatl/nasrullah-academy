import z, { ZodError } from 'zod/v4';

import {
	getTimesheets,
	ProgramHoursSchema,
	saveTimesheet,
} from '@app/api/timesheets/utils';
import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

const StaffTimesheetSchema = z.object({ hours: ProgramHoursSchema });

// Staff correction of a teacher's hours, allowed even after they submitted
const updateTimesheet = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string; teacherId: string }>,
) => {
	try {
		const { id, teacherId } = await params;
		const payload = StaffTimesheetSchema.parse(await request.json());

		const prisma = createClient();

		const [payPeriod, teacher] = await Promise.all([
			prisma.payPeriods.findUnique({ where: { id } }),
			prisma.teachers.findUnique({ where: { id: teacherId } }),
		]);

		if (!payPeriod) return notFound('Pay period not found');

		if (!teacher) return notFound('Teacher not found');

		if (payPeriod.status !== 'OPEN') {
			return badRequest('Hours can only be changed while the period is open');
		}

		await prisma.$transaction((tx) =>
			saveTimesheet(tx, teacherId, payPeriod, payload.hours),
		);

		const [row] = await getTimesheets(prisma, id, teacherId);

		return success(row);
	} catch (error) {
		console.log('Update timesheet error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const PUT = withStaff(updateTimesheet);
