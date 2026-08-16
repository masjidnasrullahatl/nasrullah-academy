import z from 'zod/v4';

export const SigninSchema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SigninPayload = z.infer<typeof SigninSchema>;
