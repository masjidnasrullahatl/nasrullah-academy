import { PayrollStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetPayrollPeriodsQueryParams = PagingQueryParams & {
	year?: number;
	month?: number;
	status?: PayrollStatus;
	keyword?: string;
};

export const CreatePayrollPeriodSchema = z
	.object({
		label: z.string().min(1, 'Label is required'),
		year: z.number().int().min(2000).max(2100),
		month: z.number().int().min(1).max(12),
		startDate: z.string().min(1, 'Start date is required'),
		endDate: z.string().min(1, 'End date is required'),
		status: z.enum(['DRAFT', 'PAID']).default('DRAFT'),
		notes: z.string().optional().nullable(),
	})
	.refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
		message: 'End date must be on or after start date',
		path: ['endDate'],
	});

export const UpdatePayrollPeriodSchema = CreatePayrollPeriodSchema;

export const UpsertPayrollEntriesSchema = z.object({
	entries: z
		.array(
			z.object({
				id: z.string().optional(),
				teacherId: z.string().min(1),
				hourlyRate: z.number().min(0).default(0),
				weekdayHours: z.number().min(0).default(0),
				weekendHours: z.number().min(0).default(0),
				payStatus: z.enum(['DRAFT', 'PAID']).default('DRAFT'),
				notes: z.string().optional().nullable(),
			}),
		)
		.min(1),
});

export const AddTeachersToPeriodSchema = z.object({
	teacherIds: z.array(z.string()).min(1),
});

export type CreatePayrollPeriodPayload = z.infer<typeof CreatePayrollPeriodSchema>;
export type UpdatePayrollPeriodPayload = z.infer<typeof UpdatePayrollPeriodSchema>;
export type UpsertPayrollEntriesPayload = z.infer<typeof UpsertPayrollEntriesSchema>;
export type AddTeachersToPeriodPayload = z.infer<typeof AddTeachersToPeriodSchema>;
