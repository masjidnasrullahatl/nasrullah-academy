import { Prisma } from '@prisma/client';

import {
	mapStudentPrograms,
	studentProgramsInclude,
} from '@app/api/students/utils';

import { ScholarshipPayload } from './types';

export const scholarshipInclude = {
	student: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			family: { select: { id: true, name: true } },
			programs: studentProgramsInclude,
		},
	},
} satisfies Prisma.ScholarshipsInclude;

type ScholarshipWithStudent = Prisma.ScholarshipsGetPayload<{
	include: typeof scholarshipInclude;
}>;

export const mapScholarship = (scholarship: ScholarshipWithStudent) => ({
	...scholarship,
	amountReceived: Number(scholarship.amountReceived),
	postedAmount: scholarship.postedAmount && Number(scholarship.postedAmount),
	student: {
		...scholarship.student,
		programs: mapStudentPrograms(scholarship.student.programs),
	},
});

export const toScholarshipData = (payload: ScholarshipPayload) => ({
	studentId: payload.studentId,
	donorName: payload.donorName || null,
	amountReceived: payload.amountReceived,
	receivedAt: new Date(payload.receivedAt),
	startMonth: new Date(payload.startMonth),
	endMonth: new Date(payload.endMonth),
	notes: payload.notes || null,
});
