import { getTimesheets } from '@app/api/timesheets/utils';
import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

// Every teacher's hours by program for one pay period
const getPeriodTimesheets = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const period = await prisma.payPeriods.findUnique({ where: { id } });

	if (!period) return notFound('Pay period not found');

	return success(await getTimesheets(prisma, id));
};

export const GET = withStaff(getPeriodTimesheets);
