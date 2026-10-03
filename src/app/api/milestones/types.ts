import { MilestoneType } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetMilestonesQueryParams = PagingQueryParams & {
	keyword?: string;
	studentId?: string;
	programId?: string;
	type?: MilestoneType;
};

export const CreateMilestoneSchema = z
	.object({
		studentId: z.string().min(1, 'Student is required'),
		type: z.enum(['JUZ', 'BOOK']),
		juzNumber: z.number().int().min(1).max(30).optional().nullable(),
		bookName: z.string().trim().optional().nullable(),
		completedAt: z.string().min(1, 'Date is required'),
		notes: z.string().optional().nullable(),
	})
	.superRefine((data, ctx) => {
		if (data.type === 'JUZ' && !data.juzNumber) {
			ctx.addIssue({
				code: 'custom',
				path: ['juzNumber'],
				message: 'Select the Juz',
			});
		}

		if (data.type === 'BOOK' && !data.bookName) {
			ctx.addIssue({
				code: 'custom',
				path: ['bookName'],
				message: 'Book name is required',
			});
		}
	});

export const UpdateMilestoneSchema = CreateMilestoneSchema;

export type CreateMilestonePayload = z.infer<typeof CreateMilestoneSchema>;
export type UpdateMilestonePayload = z.infer<typeof UpdateMilestoneSchema>;
