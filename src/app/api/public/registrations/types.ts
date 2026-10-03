import z from 'zod/v4';

export const RegistrationStudentSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required'),
	lastName: z.string().trim().min(1, 'Last name is required'),
	gender: z.enum(['BOY', 'GIRL'], 'Select boy or girl'),
	dateOfBirth: z.string().min(1, 'Date of birth is required'),
	notes: z.string().trim().optional().nullable(),
});

export const SubmitRegistrationSchema = z.object({
	programSlug: z.string().min(1),
	parentFirstName: z.string().trim().min(1, 'First name is required'),
	parentLastName: z.string().trim().min(1, 'Last name is required'),
	email: z.string().trim().email('Enter a valid email'),
	phone: z.string().trim().min(7, 'Phone number is required'),
	emergencyPhone: z.string().trim().optional().nullable(),
	address: z.string().trim().min(1, 'Address is required'),
	preferredTime: z.string().optional().nullable(),
	notes: z.string().trim().optional().nullable(),
	students: z
		.array(RegistrationStudentSchema)
		.min(1, 'Add at least one student')
		.max(10),
	payByCard: z.boolean().default(false),
	// hidden field; real people leave it empty, bots fill it in
	website: z.string().optional().nullable(),
});

export type RegistrationStudent = z.infer<typeof RegistrationStudentSchema>;
export type SubmitRegistrationPayload = z.infer<
	typeof SubmitRegistrationSchema
>;

export type PublicProgram = {
	name: string;
	slug: string;
	publicInfo: string | null;
	registrationFee: number;
	monthlyFees: number[];
	classTimes: string[];
	cardEnabled: boolean;
};
