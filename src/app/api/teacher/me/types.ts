import z from 'zod/v4';

export const UpdateTeacherProfileSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	phoneNumber: z.string().optional(),
});

export type UpdateTeacherProfilePayload = z.infer<
	typeof UpdateTeacherProfileSchema
>;

export type TeacherMyProfile = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	hourlyRate: number | null;
};
