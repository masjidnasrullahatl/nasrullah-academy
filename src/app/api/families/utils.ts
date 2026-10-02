import { Prisma } from '@prisma/client';
import sortBy from 'lodash/sortBy';

export const familyProgramsInclude = {
	include: { program: { select: { id: true, name: true } } },
} satisfies Prisma.Families$programsArgs;

type FamilyProgramWithProgram = Prisma.FamilyProgramsGetPayload<
	typeof familyProgramsInclude
>;

export const mapFamilyPrograms = (programs: FamilyProgramWithProgram[]) =>
	sortBy(
		programs.map((item) => ({
			id: item.program.id,
			name: item.program.name,
			studentCount: item.studentCount,
			monthlyFee: Number(item.monthlyFee),
		})),
		'name',
	);
