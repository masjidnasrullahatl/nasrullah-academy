import { PaymentStatus, Prisma } from '@prisma/client';
import dayjs from 'dayjs';

import { formatMoney } from '@utils/money';

type Tx = Prisma.TransactionClient;

type ScholarshipToPost = {
	id: string;
	studentId: string;
	donorName: string | null;
	amountReceived: number;
	// YYYY-MM-DD; the money counts in this month
	receivedAt: string;
	startMonth: string;
	endMonth: string;
};

/** A reason shown to staff; nothing is saved when it is thrown. */
export class ScholarshipPostError extends Error {}

const statusFor = (totalDue: number, totalPaid: number): PaymentStatus => {
	if (totalDue <= 0 && totalPaid <= 0) return 'NA';

	if (totalPaid >= totalDue) return 'PAID';

	return totalPaid > 0 ? 'PARTIAL' : 'UNPAID';
};

const buildNote = (
	studentName: string,
	{ amountReceived, donorName, receivedAt, startMonth, endMonth }: ScholarshipToPost,
) => {
	const month = (value: string) => dayjs(value.slice(0, 10)).format('MMM YYYY');

	return `Scholarship for ${studentName}: ${formatMoney(amountReceived)} from ${
		donorName || 'an anonymous donor'
	}, received ${dayjs(receivedAt.slice(0, 10)).format('MM/DD/YYYY')}, covers ${month(
		startMonth,
	)} to ${month(endMonth)}.`;
};

/**
 * Adds the money to the family's Monthly Payments row for the month it was
 * received, so it counts in that month's totals. A family's other tuition on
 * the row stays as it is.
 */
export const postScholarship = async (
	tx: Tx,
	scholarship: ScholarshipToPost,
) => {
	const student = await tx.students.findUniqueOrThrow({
		where: { id: scholarship.studentId },
		select: {
			firstName: true,
			lastName: true,
			familyId: true,
			programs: {
				select: { programId: true },
				orderBy: { createdAt: 'asc' },
				take: 1,
			},
		},
	});

	const programId = student.programs[0]?.programId;

	if (!programId) {
		throw new ScholarshipPostError(
			'Add this student to a program first, so the money can go on a payment record',
		);
	}

	const { familyId } = student;
	const year = Number(scholarship.receivedAt.slice(0, 4));
	const month = Number(scholarship.receivedAt.slice(5, 7));
	const amount = scholarship.amountReceived;
	const receivedAt = new Date(scholarship.receivedAt);
	const note = buildNote(
		`${student.firstName} ${student.lastName}`,
		scholarship,
	);

	const key = { familyId, programId, year, month };

	const existing = await tx.monthlyInvoices.findUnique({
		where: { familyId_programId_year_month: key },
	});

	const familyProgram = existing
		? null
		: await tx.familyPrograms.findUnique({
				where: { familyId_programId: { familyId, programId } },
			});

	const invoice = existing
		? await tx.monthlyInvoices.update({
				where: { id: existing.id },
				data: {
					tuitionFee: Number(existing.tuitionFee) + amount,
					paidTuitionFee: Number(existing.paidTuitionFee) + amount,
					totalDue: Number(existing.totalDue) + amount,
					totalPaid: Number(existing.totalPaid) + amount,
					paymentStatus: statusFor(
						Number(existing.totalDue) + amount,
						Number(existing.totalPaid) + amount,
					),
					payMethod: ['NA', 'FREE'].includes(existing.payMethod)
						? 'OTHER'
						: existing.payMethod,
					paidAt: existing.paidAt || receivedAt,
					notes: existing.notes ? `${existing.notes}\n${note}` : note,
				},
			})
		: await tx.monthlyInvoices.create({
				data: {
					...key,
					studentCount: familyProgram?.studentCount ?? 1,
					tuitionFee: amount,
					paidTuitionFee: amount,
					totalDue: amount,
					totalPaid: amount,
					balance: 0,
					payMethod: 'OTHER',
					paymentStatus: 'PAID',
					paidAt: receivedAt,
					notes: note,
				},
			});

	await tx.scholarships.update({
		where: { id: scholarship.id },
		data: {
			postedInvoiceId: invoice.id,
			postedAmount: amount,
			postedNote: note,
		},
	});
};

/** Takes back what postScholarship added, before an edit or a delete. */
export const undoScholarshipPost = async (
	tx: Tx,
	scholarship: {
		postedInvoiceId: string | null;
		postedAmount: Prisma.Decimal | null;
		postedNote: string | null;
	},
) => {
	const { postedInvoiceId, postedNote } = scholarship;

	if (!postedInvoiceId) return;

	const invoice = await tx.monthlyInvoices.findUnique({
		where: { id: postedInvoiceId },
	});

	if (!invoice) return;

	const amount = Number(scholarship.postedAmount || 0);
	const totalDue = Math.max(Number(invoice.totalDue) - amount, 0);
	const totalPaid = Math.max(Number(invoice.totalPaid) - amount, 0);

	await tx.monthlyInvoices.update({
		where: { id: invoice.id },
		data: {
			tuitionFee: Math.max(Number(invoice.tuitionFee) - amount, 0),
			paidTuitionFee: Math.max(Number(invoice.paidTuitionFee) - amount, 0),
			totalDue,
			totalPaid,
			balance: totalDue - totalPaid,
			paymentStatus: statusFor(totalDue, totalPaid),
			notes:
				(invoice.notes || '')
					.split('\n')
					.filter((line) => line !== postedNote)
					.join('\n') || null,
		},
	});
};
