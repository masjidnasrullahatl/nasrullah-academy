import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetScholarshipsQueryParams = PagingQueryParams & {
	keyword?: string;
	familyId?: string;
};

export const ScholarshipSchema = z.object({
	studentId: z.string().min(1, 'Student is required'),
	donorName: z.string().trim().optional().nullable(),
	amountReceived: z.number().positive('Enter the amount received'),
	receivedAt: z.string().optional().nullable(),
	startMonth: z.string().min(1, 'First month is required'),
	endMonth: z.string().min(1, 'Last month is required'),
	notes: z.string().optional().nullable(),
});

export type ScholarshipPayload = z.infer<typeof ScholarshipSchema>;
