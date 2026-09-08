import { AuthRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../utils';

const getTeacherPayPeriods = async (request: AuthRequest) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) return notFound('Teacher profile not found');

	const prisma = createClient();

	const periods = await prisma.payPeriods.findMany({
		orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
	});

	return success(periods);
};

export const GET = withAuth(getTeacherPayPeriods);
