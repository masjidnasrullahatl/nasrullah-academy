import { PayPeriodStatus } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetPayPeriodsQueryParams = PagingQueryParams & {
	keyword?: string;
	status?: PayPeriodStatus;
};

export const CreatePayPeriodSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		startDate: z.coerce.date(),
		endDate: z.coerce.date(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: 'End date must be after start date',
		path: ['endDate'],
	});

export const UpdatePayPeriodSchema = z
	.object({
		name: z.string().min(1).optional(),
		startDate: z.coerce.date().optional(),
		endDate: z.coerce.date().optional(),
		status: z.enum(['OPEN', 'LOCKED', 'PAID']).optional(),
	})
	.refine(
		(data) => {
			if (!data.startDate || !data.endDate) {
				return true;
			}

			return data.endDate > data.startDate;
		},
		{
			message: 'End date must be after start date',
			path: ['endDate'],
		},
	);

export type CreatePayPeriodPayload = z.infer<typeof CreatePayPeriodSchema>;
export type UpdatePayPeriodPayload = z.infer<typeof UpdatePayPeriodSchema>;
