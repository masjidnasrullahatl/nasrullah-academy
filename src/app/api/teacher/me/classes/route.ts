import { AuthRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../utils';

const getMyClasses = async (request: AuthRequest) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) {
		return notFound('Teacher profile not found');
	}

	const prisma = createClient();

	const classes = await prisma.classes.findMany({
		where: {
			teacherId: teacher.id,
			status: 'ACTIVE',
		},
		orderBy: { name: 'asc' },
		include: {
			program: {
				select: { name: true },
			},
			enrollments: {
				where: { status: 'ACTIVE' },
				include: {
					student: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							gender: true,
							enrolledAt: true,
						},
					},
				},
			},
			_count: {
				select: {
					enrollments: {
						where: { status: 'ACTIVE' },
					},
				},
			},
		},
	});

	return success(classes);
};

export const GET = withAuth(getMyClasses);
