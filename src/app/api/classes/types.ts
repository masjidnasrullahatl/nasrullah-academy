import { ArchiveStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetClassesQueryParams = PagingQueryParams & {
	keyword?: string;
	teacherId?: string;
	status?: ArchiveStatus;
};

export const CreateClassSchema = z.object({
	name: z.string().min(1, 'Class name is required'),
	teacherId: z.string().optional().nullable(),
	status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const UpdateClassSchema = CreateClassSchema;

export type CreateClassPayload = z.infer<typeof CreateClassSchema>;
export type UpdateClassPayload = z.infer<typeof UpdateClassSchema>;
