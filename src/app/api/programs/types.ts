import { ArchiveStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetProgramsQueryParams = PagingQueryParams & {
	keyword?: string;
	status?: ArchiveStatus;
};

export const CreateProgramSchema = z.object({
	code: z.enum(['HIFZ', 'WEEKEND']),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional().nullable(),
	status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const UpdateProgramSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional().nullable(),
	status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export type CreateProgramPayload = z.infer<typeof CreateProgramSchema>;
export type UpdateProgramPayload = z.infer<typeof UpdateProgramSchema>;
