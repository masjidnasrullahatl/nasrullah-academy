import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdateInvoiceSchema } from '../types';
import { calcTotals, mapInvoice } from '../utils';

const getDetail = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const invoice = await prisma.monthlyInvoices.findUnique({
		where: { id },
		include: { family: true, program: true },
	});

	if (!invoice) return notFound('Invoice not found');

	return success(mapInvoice(invoice));
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

		if (!existing) return notFound('Invoice not found');

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
			include: { family: true, program: true },
		});

		return success(mapInvoice(invoice));
	} catch (error) {
		console.log('Update invoice error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
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
		include: { family: true, program: true },
	});

	if (!invoice) return notFound('Invoice not found');

	await prisma.monthlyInvoices.delete({ where: { id } });

	return success(mapInvoice(invoice));
};

export const GET = withAuth(getDetail);
export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
