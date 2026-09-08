import z from 'zod/v4';

export const CreateTimeEntrySchema = z.object({
	date: z.coerce.date(),
	hours: z.number().min(0.25).max(24),
	classId: z.string().min(1),
	payPeriodId: z.string().min(1),
	notes: z.string().optional(),
});

export const UpdateTimeEntrySchema = CreateTimeEntrySchema.omit({
	payPeriodId: true,
}).partial();

export type CreateTimeEntryPayload = z.infer<typeof CreateTimeEntrySchema>;
export type UpdateTimeEntryPayload = z.infer<typeof UpdateTimeEntrySchema>;
