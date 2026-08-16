import { RecordStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetTeachersQueryParams = PagingQueryParams & {
	keyword?: string;
	status?: RecordStatus;
};

export const CreateTeacherSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	phoneNumber: z.string().optional().nullable(),
	email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
	zelleId: z.string().optional().nullable(),
	hourlyRate: z.number().min(0, 'Hourly rate must be greater than or equal to 0'),
	status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const UpdateTeacherSchema = CreateTeacherSchema;

export type CreateTeacherPayload = z.infer<typeof CreateTeacherSchema>;
export type UpdateTeacherPayload = z.infer<typeof UpdateTeacherSchema>;
