import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export const CreateProgramSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export const UpdateProgramSchema = CreateProgramSchema.partial();

export type CreateProgramPayload = z.infer<typeof CreateProgramSchema>;
export type UpdateProgramPayload = z.infer<typeof UpdateProgramSchema>;

export interface GetProgramsQueryParams extends PagingQueryParams {
	keyword?: string;
	status?: string;
}
