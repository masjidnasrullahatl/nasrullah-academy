import { z } from 'zod/v4';

export const AssignStudentsSchema = z.object({
	studentIds: z.array(z.string()).min(1, 'Select at least one student'),
});

export type AssignStudentsPayload = z.infer<typeof AssignStudentsSchema>;
