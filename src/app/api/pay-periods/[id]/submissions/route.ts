import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

const getSubmissions = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const period = await prisma.payPeriods.findUnique({ where: { id } });
	if (!period) {
		return notFound('Pay period not found');
	}

	const [teachers, submissions, hourGroups] = await Promise.all([
		prisma.teachers.findMany({
			where: {
				status: 'ACTIVE',
				classes: {
					some: {},
				},
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				_count: {
					select: {
						classes: true,
					},
				},
			},
			orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
		}),
		prisma.teacherSubmissions.findMany({
			where: { payPeriodId: id },
			select: {
				teacherId: true,
				submittedAt: true,
			},
		}),
		prisma.timeEntries.groupBy({
			by: ['teacherId'],
			where: { payPeriodId: id },
			_sum: {
				hours: true,
			},
		}),
	]);

	const submissionByTeacherId = new Map(
		submissions.map((submission) => [submission.teacherId, submission]),
	);
	const hourByTeacherId = new Map(
		hourGroups.map((group) => [group.teacherId, Number(group._sum.hours || 0)]),
	);

	const data = teachers.map((teacher) => {
		const submission = submissionByTeacherId.get(teacher.id);
		return {
			teacherId: teacher.id,
			teacherName: `${teacher.firstName} ${teacher.lastName}`,
			submitted: Boolean(submission),
			submittedAt: submission?.submittedAt || null,
			totalHours: hourByTeacherId.get(teacher.id) || 0,
			classCount: teacher._count.classes,
		};
	});

	return success(data);
};

export const GET = withStaff(getSubmissions);
