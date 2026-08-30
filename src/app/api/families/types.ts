import { RecordStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetFamiliesQueryParams = PagingQueryParams & {
	keyword?: string;
	status?: RecordStatus;
};

export const StudentInputSchema = z.object({
	id: z.string().optional(),
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	gender: z.enum(['BOY', 'GIRL']),
	dateOfBirth: z.union([z.string(), z.date()]).optional().nullable(),
	status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
	notes: z.string().optional().nullable(),
});

export const CreateFamilySchema = z.object({
	name: z.string().min(1, 'Family / parent name is required'),
	fatherName: z.string().optional().nullable(),
	motherName: z.string().optional().nullable(),
	primaryPhone: z.string().min(7, 'Phone number is required'),
	secondaryPhone: z.string().optional().nullable(),
	email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
	address: z.string().optional().nullable(),
	status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
	notes: z.string().optional().nullable(),
	students: z.array(StudentInputSchema).default([]),
});

export const UpdateFamilySchema = CreateFamilySchema;

export type StudentInput = z.infer<typeof StudentInputSchema>;
export type CreateFamilyPayload = z.infer<typeof CreateFamilySchema>;
export type UpdateFamilyPayload = z.infer<typeof UpdateFamilySchema>;
