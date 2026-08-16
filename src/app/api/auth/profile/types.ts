import z from 'zod/v4';

export const UpdateProfileSchema = z.object({
	fullName: z.string().min(1, 'Full name is required'),
	phoneNumber: z.string().optional(),
});

export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;

export type ProfilePayload = {
	id: string;
	email: string;
	fullName: string;
	phoneNumber: string;
};
