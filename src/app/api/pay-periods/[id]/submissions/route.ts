import keyBy from 'lodash/keyBy';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

const getSubmissions = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const period = await prisma.payPeriods.findUnique({ where: { id } });

	if (!period) return notFound('Pay period not found');

	const getTeachersQuery = prisma.teachers.findMany({
		where: {
			status: 'ACTIVE',
			classes: { some: {} },
		},
		select: {
			id: true,
			firstName: true,
			lastName: true,
			_count: { select: { classes: true } },
		},
		orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
	});

	const getTeacherSubmissionsQuery = prisma.teacherSubmissions.findMany({
		where: { payPeriodId: id },
		select: { teacherId: true, submittedAt: true },
	});

	const getHourGroupsQuery = prisma.timeEntries.groupBy({
		by: ['teacherId'],
		where: { payPeriodId: id },
		_sum: { hours: true },
	});

	const [teachers, submissions, hourGroups] = await Promise.all([
		getTeachersQuery,
		getTeacherSubmissionsQuery,
		getHourGroupsQuery,
	]);

	const submissionByTeacherId = keyBy(submissions, 'teacherId');
	const hourByTeacherId = keyBy(hourGroups, 'teacherId');

	const data = teachers.map((teacher) => {
		const submission = submissionByTeacherId[teacher.id];

		return {
			teacherId: teacher.id,
			teacherName: `${teacher.firstName} ${teacher.lastName}`,
			submitted: Boolean(submission),
			submittedAt: submission?.submittedAt || null,
			totalHours: Number(hourByTeacherId[teacher.id]?._sum.hours || 0),
			classCount: teacher._count.classes,
		};
	});

	return success(data);
};

export const GET = withStaff(getSubmissions);
