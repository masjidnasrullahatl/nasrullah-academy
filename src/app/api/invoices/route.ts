import { NextResponse } from 'next/server';

import { PaymentStatus, PayMethod, Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { badRequest, internalServerError, success } from '../utils/response';

import { CreateInvoiceSchema } from './types';
import { calcTotals, mapInvoice, toNumber } from './utils';

const buildWhere = (searchParams: URLSearchParams): Prisma.MonthlyInvoicesWhereInput => {
	const year = Number(searchParams.get('year') || 0);
	const month = Number(searchParams.get('month') || 0);
	const keyword = searchParams.get('keyword') || '';
	const programId = searchParams.get('programId') || '';
	const paymentStatus = searchParams.get('paymentStatus') || '';
	const payMethod = searchParams.get('payMethod') || '';
	const familyId = searchParams.get('familyId') || '';

	const where: Prisma.MonthlyInvoicesWhereInput = {};

	if (year) where.year = year;
	if (month) where.month = month;
	if (programId) where.programId = programId;
	if (familyId) where.familyId = familyId;
	if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
	if (payMethod) where.payMethod = payMethod as PayMethod;
	if (keyword) {
		where.family = {
			OR: [
				{ name: { contains: keyword, mode: 'insensitive' } },
				{ primaryPhone: { contains: keyword, mode: 'insensitive' } },
				{ fatherName: { contains: keyword, mode: 'insensitive' } },
				{ motherName: { contains: keyword, mode: 'insensitive' } },
			],
		};
	}

	return where;
};

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const skip = (page - 1) * limit;

	const where = buildWhere(searchParams);
	const prisma = createClient();

	const [total, invoices, aggregate] = await Promise.all([
		prisma.monthlyInvoices.count({ where }),
		prisma.monthlyInvoices.findMany({
			where,
			skip,
			take: limit,
			include: {
				family: true,
				program: true,
			},
			orderBy: [{ family: { name: 'asc' } }],
		}),
		prisma.monthlyInvoices.aggregate({
			where,
			_sum: {
				studentCount: true,
				registrationFee: true,
				tuitionFee: true,
				bookFee: true,
				totalDue: true,
				paidRegistrationFee: true,
				paidTuitionFee: true,
				paidBookFee: true,
				extraPaid: true,
				totalPaid: true,
				balance: true,
			},
		}),
	]);

	return NextResponse.json({
		data: invoices.map(mapInvoice),
		total,
		summary: {
			studentCount: Number(aggregate._sum.studentCount || 0),
			registrationFee: toNumber(aggregate._sum.registrationFee),
			tuitionFee: toNumber(aggregate._sum.tuitionFee),
			bookFee: toNumber(aggregate._sum.bookFee),
			totalDue: toNumber(aggregate._sum.totalDue),
			paidRegistrationFee: toNumber(aggregate._sum.paidRegistrationFee),
			paidTuitionFee: toNumber(aggregate._sum.paidTuitionFee),
			paidBookFee: toNumber(aggregate._sum.paidBookFee),
			extraPaid: toNumber(aggregate._sum.extraPaid),
			totalPaid: toNumber(aggregate._sum.totalPaid),
			balance: toNumber(aggregate._sum.balance),
		},
		error: null,
	});
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = CreateInvoiceSchema.parse(body);
		const prisma = createClient();

		const existing = await prisma.monthlyInvoices.findUnique({
			where: {
				familyId_programId_year_month: {
					familyId: data.familyId,
					programId: data.programId,
					year: data.year,
					month: data.month,
				},
			},
		});

		if (existing) return badRequest('Invoice already exists for this family/program/month');

		const totals = calcTotals(data);

		const invoice = await prisma.monthlyInvoices.create({
			data: {
				familyId: data.familyId,
				programId: data.programId,
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

		return success(mapInvoice(invoice));
	} catch (error) {
		console.log('Create invoice error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withAuth(getPaging);
export const POST = withAuth(create);
