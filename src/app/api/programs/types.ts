import { Prisma } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export const CreateProgramSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
	slug: z
		.string()
		.trim()
		.regex(/^[a-z0-9-]*$/, 'Use lowercase letters, numbers and dashes only')
		.optional()
		.nullable(),
	registrationOpen: z.boolean().optional(),
	registrationFee: z.number().min(0).optional(),
	monthlyFees: z.array(z.number().min(0)).optional(),
	classTimes: z.array(z.string().trim().min(1)).optional(),
	publicInfo: z.string().optional().nullable(),
});

export const UpdateProgramSchema = CreateProgramSchema.partial();

export type CreateProgramPayload = z.infer<typeof CreateProgramSchema>;
export type UpdateProgramPayload = z.infer<typeof UpdateProgramSchema>;

export interface GetProgramsQueryParams extends PagingQueryParams {
	keyword?: string;
	status?: string;
}

export const isUniqueError = (error: unknown) =>
	error instanceof Prisma.PrismaClientKnownRequestError &&
	error.code === 'P2002';
