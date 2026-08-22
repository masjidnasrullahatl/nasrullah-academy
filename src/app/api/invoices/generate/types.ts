import z from 'zod/v4';

export const GenerateInvoicesSchema = z.object({
	year: z.number().int(),
	month: z.number().int().min(1).max(12),
	programId: z.string().min(1),
	copyFromPreviousMonth: z.boolean().default(false),
});

export type GenerateInvoicesPayload = z.infer<typeof GenerateInvoicesSchema>;
