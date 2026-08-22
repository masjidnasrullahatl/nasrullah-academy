import { Prisma } from '@prisma/client';

export const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
	Number(value ?? 0);

export type InvoiceTotalsPayload = {
	registrationFee: number;
	tuitionFee: number;
	bookFee: number;
	paidRegistrationFee: number;
	paidTuitionFee: number;
	paidBookFee: number;
	extraPaid: number;
};

export const calcTotals = (payload: InvoiceTotalsPayload) => {
	const totalDue = payload.registrationFee + payload.tuitionFee + payload.bookFee;
	const totalPaid =
		payload.paidRegistrationFee +
		payload.paidTuitionFee +
		payload.paidBookFee +
		payload.extraPaid;
	const balance = totalDue - totalPaid;

	return { totalDue, totalPaid, balance };
};

export const mapInvoice = (
	invoice: Prisma.MonthlyInvoicesGetPayload<{ include: { family: true; program: true } }>,
) => ({
	...invoice,
	registrationFee: toNumber(invoice.registrationFee),
	tuitionFee: toNumber(invoice.tuitionFee),
	bookFee: toNumber(invoice.bookFee),
	totalDue: toNumber(invoice.totalDue),
	paidRegistrationFee: toNumber(invoice.paidRegistrationFee),
	paidTuitionFee: toNumber(invoice.paidTuitionFee),
	paidBookFee: toNumber(invoice.paidBookFee),
	extraPaid: toNumber(invoice.extraPaid),
	totalPaid: toNumber(invoice.totalPaid),
	balance: toNumber(invoice.balance),
});
