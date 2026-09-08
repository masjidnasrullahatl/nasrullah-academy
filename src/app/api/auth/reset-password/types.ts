import z from 'zod/v4';

export const ResetPasswordSchema = z.object({
	email: z.string().email('Invalid email'),
});

export const ConfirmResetPasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type ConfirmResetPasswordPayload = z.infer<
	typeof ConfirmResetPasswordSchema
>;

export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;
