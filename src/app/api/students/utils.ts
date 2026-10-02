import { Prisma } from '@prisma/client';
import sortBy from 'lodash/sortBy';

export const studentProgramsInclude = {
	include: { program: { select: { id: true, name: true } } },
} satisfies Prisma.Students$programsArgs;

type StudentProgramWithProgram = Prisma.StudentProgramsGetPayload<
	typeof studentProgramsInclude
>;

export const mapStudentPrograms = (programs: StudentProgramWithProgram[]) =>
	sortBy(
		programs.map((item) => item.program),
		'name',
	);
