import { Gender, RecordStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetStudentsQueryParams = PagingQueryParams & {
	keyword?: string;
	familyId?: string;
	classId?: string;
	gender?: Gender;
	status?: RecordStatus;
};

export const StudentInputSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	gender: z.enum(['BOY', 'GIRL']),
	dateOfBirth: z.string().optional().nullable(),
	status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
	notes: z.string().optional().nullable(),
});

export const CreateStudentSchema = StudentInputSchema.extend({
	familyId: z.string().min(1, 'Family is required'),
});

export const UpdateStudentSchema = CreateStudentSchema;

export type CreateStudentPayload = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentPayload = z.infer<typeof UpdateStudentSchema>;
