import { Prisma } from '@prisma/client';
import z from 'zod/v4';

import { RegistrationStudent } from '@app/api/public/registrations/types';

export const ApproveRegistrationSchema = z.object({
	// existing family to add the students to; null creates a new family
	familyId: z.string().optional().nullable(),
});

export const registrationInclude = {
	program: { select: { id: true, name: true } },
	family: { select: { id: true, name: true } },
} satisfies Prisma.RegistrationsInclude;

type RegistrationWithRelations = Prisma.RegistrationsGetPayload<{
	include: typeof registrationInclude;
}>;

export const mapRegistration = (registration: RegistrationWithRelations) => ({
	...registration,
	students: registration.students as unknown as RegistrationStudent[],
	monthlyFee: Number(registration.monthlyFee),
	registrationFee: Number(registration.registrationFee),
	amountDue: Number(registration.amountDue),
});

export type RegistrationRow = ReturnType<typeof mapRegistration>;
