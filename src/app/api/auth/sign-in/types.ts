import z from 'zod/v4';

export const SignInSchema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignInPayload = z.infer<typeof SignInSchema>;
