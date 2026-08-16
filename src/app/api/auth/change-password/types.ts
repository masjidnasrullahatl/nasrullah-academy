import z from 'zod/v4';

export const ChangePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(6, 'Current password must be at least 6 characters'),
		newPassword: z
			.string()
			.min(8, 'New password must be at least 8 characters'),
		confirmNewPassword: z
			.string()
			.min(8, 'Confirm new password must be at least 8 characters'),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'Passwords do not match',
		path: ['confirmNewPassword'],
	});

export type ChangePasswordPayload = z.infer<typeof ChangePasswordSchema>;
