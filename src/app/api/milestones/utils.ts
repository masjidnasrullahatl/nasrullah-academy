import { Prisma } from '@prisma/client';

import {
	mapStudentPrograms,
	studentProgramsInclude,
} from '@app/api/students/utils';

import { CreateMilestonePayload } from './types';

export const milestoneInclude = {
	student: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			family: { select: { id: true, name: true } },
			programs: studentProgramsInclude,
		},
	},
} satisfies Prisma.MilestonesInclude;

type MilestoneWithStudent = Prisma.MilestonesGetPayload<{
	include: typeof milestoneInclude;
}>;

export const mapMilestone = (milestone: MilestoneWithStudent) => ({
	...milestone,
	student: {
		...milestone.student,
		programs: mapStudentPrograms(milestone.student.programs),
	},
});

export const toMilestoneData = (payload: CreateMilestonePayload) => ({
	studentId: payload.studentId,
	type: payload.type,
	juzNumber: payload.type === 'JUZ' ? payload.juzNumber : null,
	bookName: payload.type === 'BOOK' ? payload.bookName : null,
	completedAt: new Date(payload.completedAt),
	notes: payload.notes || null,
});

export const isDuplicateJuzError = (error: unknown) =>
	error instanceof Prisma.PrismaClientKnownRequestError &&
	error.code === 'P2002';
