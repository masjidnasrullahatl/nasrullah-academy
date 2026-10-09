import { Prisma } from '@prisma/client';
import sortBy from 'lodash/sortBy';

import { chargedFee } from '@utils/registrationPricing';

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
			discount: Number(item.discount),
			discountNote: item.discountNote,
			chargedFee: chargedFee(Number(item.monthlyFee), Number(item.discount)),
		})),
		'name',
	);
