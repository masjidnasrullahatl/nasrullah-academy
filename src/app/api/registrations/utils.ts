import { Prisma, PrismaClient } from '@prisma/client';

import { RegistrationStudent } from '@app/api/public/registrations/types';

import { chargedFee, tuitionForKids } from '@utils/registrationPricing';

import { ApprovalOptions } from './types';

type Tx = Prisma.TransactionClient | PrismaClient;

const digits = (value: string | null | undefined) =>
	(value || '').replace(/\D/g, '');

/** Existing family with the same phone (either number) or email, if any. */
export const findMatchingFamily = async (
	prisma: Tx,
	registration: { phone: string; secondaryPhone: string | null; email: string },
) => {
	const phones = [registration.phone, registration.secondaryPhone]
		.map(digits)
		.filter((phone) => phone.length >= 7);

	const families = await prisma.families.findMany({
		select: {
			id: true,
			name: true,
			primaryPhone: true,
			secondaryPhone: true,
			email: true,
		},
	});

	const email = registration.email.trim().toLowerCase();

	return (
		families.find(
			(family) =>
				phones.includes(digits(family.primaryPhone)) ||
				(family.secondaryPhone && phones.includes(digits(family.secondaryPhone))),
		) ||
		families.find((family) => family.email?.trim().toLowerCase() === email) ||
		null
	);
};

// Health details from the form are kept in the student's notes
const studentNotes = (student: RegistrationStudent) =>
	[
		student.allergies && `Food allergies: ${student.allergies}`,
		student.medicalConditions &&
			`Medical conditions: ${student.medicalConditions}`,
		student.medications && `Medications/health: ${student.medications}`,
		student.notes,
	]
		.filter(Boolean)
		.join('\n') || null;

const currentPeriod = () => {
	const now = new Date();

	return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

const paidFields = (invoice: {
	registrationFee: Prisma.Decimal | number;
	tuitionFee: Prisma.Decimal | number;
	bookFee: Prisma.Decimal | number;
	extraPaid: Prisma.Decimal | number;
	totalDue: Prisma.Decimal | number;
}) => ({
	paidRegistrationFee: invoice.registrationFee,
	paidTuitionFee: invoice.tuitionFee,
	paidBookFee: invoice.bookFee,
	totalPaid: Number(invoice.totalDue) + Number(invoice.extraPaid),
	balance: -Number(invoice.extraPaid),
	payMethod: 'CARD' as const,
	paymentStatus: 'PAID' as const,
	paidAt: new Date(),
});

/**
 * Turns an approved registration into real records: family (new or existing),
 * students with the program, the family's kids/monthly fee for the program,
 * and this month's payment row including the registration fee.
 */
export const approveRegistration = async (
	tx: Prisma.TransactionClient,
	registrationId: string,
	options: ApprovalOptions,
) => {
	const { familyId, discount, discountNote, waiveRegistrationFee } = options;

	const registration = await tx.registrations.findUniqueOrThrow({
		where: { id: registrationId },
		include: { program: true },
	});

	const family = familyId
		? await tx.families.findUniqueOrThrow({
				where: { id: familyId },
				include: { students: true },
			})
		: await tx.families.create({
				data: {
					name: registration.familyName,
					fatherName: registration.fatherName,
					motherName: registration.motherName,
					primaryPhone: registration.phone,
					secondaryPhone: registration.secondaryPhone,
					email: registration.email,
					address: registration.address,
					notes: registration.notes,
				},
				include: { students: true },
			});

	const programId = registration.programId;
	const students = registration.students as unknown as RegistrationStudent[];

	for (const student of students) {
		const existing = family.students.find(
			(item) =>
				item.firstName.trim().toLowerCase() ===
				student.firstName.trim().toLowerCase(),
		);

		if (existing) {
			await tx.students.update({
				where: { id: existing.id },
				data: {
					status: 'ACTIVE',
					dateOfBirth: existing.dateOfBirth || new Date(student.dateOfBirth),
				},
			});

			await tx.studentPrograms.upsert({
				where: { studentId_programId: { studentId: existing.id, programId } },
				create: { studentId: existing.id, programId },
				update: {},
			});

			continue;
		}

		await tx.students.create({
			data: {
				familyId: family.id,
				firstName: student.firstName,
				lastName: student.lastName,
				gender: student.gender,
				dateOfBirth: new Date(student.dateOfBirth),
				enrolledAt: new Date(),
				notes: studentNotes(student),
				programs: { create: { programId } },
			},
		});
	}

	// Price the family on all of its children now in this program
	const kids = await tx.studentPrograms.count({
		where: { programId, student: { familyId: family.id, status: 'ACTIVE' } },
	});

	const monthlyFee = tuitionForKids(
		registration.program.monthlyFees.map(Number),
		kids,
	);

	const discountData = { discount, discountNote: discount > 0 ? discountNote : null };

	await tx.familyPrograms.upsert({
		where: { familyId_programId: { familyId: family.id, programId } },
		create: {
			familyId: family.id,
			programId,
			studentCount: kids,
			monthlyFee,
			...discountData,
		},
		update: { studentCount: kids, monthlyFee, ...discountData },
	});

	const charged = chargedFee(monthlyFee, discount);

	const { year, month } = currentPeriod();
	const invoiceKey = {
		familyId_programId_year_month: {
			familyId: family.id,
			programId,
			year,
			month,
		},
	};

	const existingInvoice = await tx.monthlyInvoices.findUnique({
		where: invoiceKey,
	});

	const registrationFee =
		Number(existingInvoice?.registrationFee || 0) +
		(waiveRegistrationFee ? 0 : Number(registration.registrationFee));
	const tuitionFee = existingInvoice ? Number(existingInvoice.tuitionFee) : charged;
	const bookFee = Number(existingInvoice?.bookFee || 0);
	const totalDue = registrationFee + tuitionFee + bookFee;
	const alreadyPaid = Number(existingInvoice?.totalPaid || 0);

	const invoiceData = {
		studentCount: kids,
		registrationFee,
		tuitionFee,
		bookFee,
		totalDue,
		balance: totalDue - alreadyPaid,
		notes: [
			existingInvoice?.notes || 'Online registration',
			waiveRegistrationFee && 'registration fee waived',
			discount > 0 &&
				`discount ${discount.toFixed(2)}${discountNote ? ` (${discountNote})` : ''}`,
		]
			.filter(Boolean)
			.join('; '),
	};

	const invoice = existingInvoice
		? await tx.monthlyInvoices.update({ where: invoiceKey, data: invoiceData })
		: await tx.monthlyInvoices.create({
				data: { ...invoiceData, familyId: family.id, programId, year, month },
			});

	if (registration.paymentStatus === 'PAID') {
		await tx.monthlyInvoices.update({
			where: { id: invoice.id },
			data: paidFields({ ...invoice, extraPaid: invoice.extraPaid }),
		});
	}

	return tx.registrations.update({
		where: { id: registrationId },
		data: { status: 'APPROVED', familyId: family.id, reviewedAt: new Date() },
	});
};

/**
 * Marks a family/program payment row as paid by card for the given month,
 * creating the row from the family's monthly fee if it doesn't exist yet.
 * Used when Stripe reports a successful card payment.
 */
export const markMonthPaidByCard = async (
	tx: Tx,
	familyId: string,
	programId: string,
	year: number,
	month: number,
) => {
	const key = {
		familyId_programId_year_month: { familyId, programId, year, month },
	};

	let invoice = await tx.monthlyInvoices.findUnique({ where: key });

	if (!invoice) {
		const familyProgram = await tx.familyPrograms.findUnique({
			where: { familyId_programId: { familyId, programId } },
		});

		if (!familyProgram) return null;

		invoice = await tx.monthlyInvoices.create({
			data: {
				familyId,
				programId,
				year,
				month,
				studentCount: familyProgram.studentCount,
				tuitionFee: chargedFee(
					Number(familyProgram.monthlyFee),
					Number(familyProgram.discount),
				),
				totalDue: chargedFee(
					Number(familyProgram.monthlyFee),
					Number(familyProgram.discount),
				),
				balance: chargedFee(
					Number(familyProgram.monthlyFee),
					Number(familyProgram.discount),
				),
			},
		});
	}

	return tx.monthlyInvoices.update({
		where: { id: invoice.id },
		data: paidFields(invoice),
	});
};
