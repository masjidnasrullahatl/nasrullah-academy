import { AuthRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../utils';

const getMyPayRecords = async (request: AuthRequest) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) {
		return notFound('Teacher profile not found');
	}

	const prisma = createClient();
	const payRecords = await prisma.payRecords.findMany({
		where: { teacherId: teacher.id },
		orderBy: {
			payPeriod: {
				startDate: 'desc',
			},
		},
		include: {
			payPeriod: {
				select: {
					id: true,
					name: true,
					startDate: true,
					endDate: true,
					status: true,
				},
			},
		},
	});

	const data = payRecords.map((record) => ({
		...record,
		totalHours: Number(record.totalHours),
		hourlyRate: Number(record.hourlyRate),
		totalPay: Number(record.totalPay),
	}));

	return success(data);
};

export const GET = withAuth(getMyPayRecords);
