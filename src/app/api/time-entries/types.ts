import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetTimeEntriesQueryParams = PagingQueryParams & {
	payPeriodId?: string;
	teacherId?: string;
};

export const CreateTimeEntrySchema = z.object({
	date: z.coerce.date(),
	hours: z.coerce.number().min(0.25).max(24),
	teacherId: z.string().min(1),
	classId: z.string().min(1),
	payPeriodId: z.string().min(1),
	notes: z.string().optional(),
});

export const UpdateTimeEntrySchema = CreateTimeEntrySchema.partial().omit({
	teacherId: true,
	payPeriodId: true,
});

export type CreateTimeEntryPayload = z.infer<typeof CreateTimeEntrySchema>;
export type UpdateTimeEntryPayload = z.infer<typeof UpdateTimeEntrySchema>;
