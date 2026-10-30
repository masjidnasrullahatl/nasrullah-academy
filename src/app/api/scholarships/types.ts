import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetScholarshipsQueryParams = PagingQueryParams & {
	keyword?: string;
};

export const ScholarshipSchema = z.object({
	studentId: z.string().min(1, 'Student is required'),
	donorName: z.string().trim().optional().nullable(),
	amountReceived: z.number().positive('Enter the amount received'),
	receivedAt: z.string().optional().nullable(),
	monthlyAmount: z.number().positive('Enter the monthly amount'),
	startMonth: z.string().min(1, 'Start month is required'),
	endMonth: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
});

export type ScholarshipPayload = z.infer<typeof ScholarshipSchema>;
