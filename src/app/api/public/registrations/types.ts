import z from 'zod/v4';

export const RegistrationStudentSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required'),
	lastName: z.string().trim().min(1, 'Last name is required'),
	gender: z.enum(['BOY', 'GIRL'], 'Select boy or girl'),
	dateOfBirth: z.string().min(1, 'Date of birth is required'),
	allergies: z.string().trim().optional().nullable(),
	medicalConditions: z.string().trim().optional().nullable(),
	medications: z.string().trim().optional().nullable(),
	notes: z.string().trim().optional().nullable(),
});

export const SubmitRegistrationSchema = z.object({
	programSlug: z.string().min(1),
	// The father's name is used as the family / parent name
	fatherName: z.string().trim().min(1, "Father's name is required"),
	motherName: z.string().trim().min(1, "Mother's name is required"),
	email: z.string().trim().email('Enter a valid email'),
	phone: z.string().trim().min(7, 'Phone number is required'),
	secondaryPhone: z.string().trim().min(7, 'Secondary phone is required'),
	address: z.string().trim().min(1, 'Address is required'),
	preferredTime: z.string().optional().nullable(),
	notes: z.string().trim().optional().nullable(),
	students: z
		.array(RegistrationStudentSchema)
		.min(1, 'Add at least one student')
		.max(10),
	payByCard: z.boolean().default(false),
	rulesAccepted: z.literal(true, 'Please accept the school rules'),
	rulesSignature: z.string().trim().min(3, 'Type your full name to sign'),
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
