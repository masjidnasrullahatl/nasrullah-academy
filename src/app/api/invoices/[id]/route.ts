import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdateInvoiceSchema } from '../types';

const toNumber = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

const calcTotals = (payload: {
	registrationFee: number;
	tuitionFee: number;
	bookFee: number;
	paidRegistrationFee: number;
	paidTuitionFee: number;
	paidBookFee: number;
	extraPaid: number;
}) => {
	const totalDue = payload.registrationFee + payload.tuitionFee + payload.bookFee;
	const totalPaid =
		payload.paidRegistrationFee +
		payload.paidTuitionFee +
		payload.paidBookFee +
		payload.extraPaid;
	const balance = totalDue - totalPaid;

	return { totalDue, totalPaid, balance };
};

const mapInvoice = (
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

const getDetail = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const invoice = await prisma.monthlyInvoices.findUnique({
		where: { id },
		include: {
			family: true,
			program: true,
		},
	});

	if (!invoice) {
		return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
	}

	return NextResponse.json({ data: mapInvoice(invoice), error: null });
};

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const data = UpdateInvoiceSchema.parse(body);

		const prisma = createClient();
		const existing = await prisma.monthlyInvoices.findUnique({ where: { id } });
		if (!existing) {
			return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
		}

		const totals = calcTotals(data);

		const invoice = await prisma.monthlyInvoices.update({
			where: { id },
			data: {
				year: data.year,
				month: data.month,
				studentCount: data.studentCount,
				session: data.session || null,
				registrationFee: data.registrationFee,
				tuitionFee: data.tuitionFee,
				bookFee: data.bookFee,
				totalDue: totals.totalDue,
				paidRegistrationFee: data.paidRegistrationFee,
				paidTuitionFee: data.paidTuitionFee,
				paidBookFee: data.paidBookFee,
				extraPaid: data.extraPaid,
				totalPaid: totals.totalPaid,
				balance: totals.balance,
				payMethod: data.payMethod,
				paymentStatus: data.paymentStatus,
				paidAt: data.paidAt ? new Date(data.paidAt) : null,
				notes: data.notes || null,
			},
			include: {
				family: true,
				program: true,
			},
		});

		return NextResponse.json({ data: mapInvoice(invoice), error: null });
	} catch (error) {
		console.log('Update invoice error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

const remove = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const invoice = await prisma.monthlyInvoices.findUnique({
		where: { id },
		include: {
			family: true,
			program: true,
		},
	});

	if (!invoice) {
		return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
	}

	await prisma.monthlyInvoices.delete({ where: { id } });

	return NextResponse.json({ data: mapInvoice(invoice), error: null });
};

export const GET = withAuth(getDetail);
export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
