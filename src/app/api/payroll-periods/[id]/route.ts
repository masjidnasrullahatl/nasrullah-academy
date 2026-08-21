import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdatePayrollPeriodSchema } from '../types';

const toNumber = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

const mapEntry = (
	entry: Prisma.PayrollEntriesGetPayload<{ include: { teacher: true } }>,
) => ({
	...entry,
	hourlyRate: toNumber(entry.hourlyRate),
	weekdayHours: toNumber(entry.weekdayHours),
	weekendHours: toNumber(entry.weekendHours),
	weekdayPay: toNumber(entry.weekdayPay),
	weekendPay: toNumber(entry.weekendPay),
	totalPay: toNumber(entry.totalPay),
});

const getDetail = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const period = await prisma.payrollPeriods.findUnique({
		where: { id },
		include: {
			entries: {
				include: {
					teacher: true,
				},
				orderBy: [{ teacher: { lastName: 'asc' } }, { teacher: { firstName: 'asc' } }],
			},
		},
	});

	if (!period) {
		return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 });
	}

	const entries = period.entries.map(mapEntry);

	return NextResponse.json({
		data: {
			...period,
			entries,
			teacherCount: entries.length,
			totalWeekdayPay: entries.reduce((sum, entry) => sum + entry.weekdayPay, 0),
			totalWeekendPay: entries.reduce((sum, entry) => sum + entry.weekendPay, 0),
			totalPay: entries.reduce((sum, entry) => sum + entry.totalPay, 0),
		},
		error: null,
	});
};

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const data = UpdatePayrollPeriodSchema.parse(body);
		const prisma = createClient();

		const existing = await prisma.payrollPeriods.findUnique({ where: { id } });
		if (!existing) {
			return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 });
		}

		const period = await prisma.payrollPeriods.update({
			where: { id },
			data: {
				label: data.label,
				year: data.year,
				month: data.month,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
				status: data.status,
				notes: data.notes || null,
			},
			include: {
				entries: {
					include: {
						teacher: true,
					},
					orderBy: [{ teacher: { lastName: 'asc' } }, { teacher: { firstName: 'asc' } }],
				},
			},
		});

		const entries = period.entries.map(mapEntry);

		return NextResponse.json({
			data: {
				...period,
				entries,
				teacherCount: entries.length,
				totalWeekdayPay: entries.reduce((sum, entry) => sum + entry.weekdayPay, 0),
				totalWeekendPay: entries.reduce((sum, entry) => sum + entry.weekendPay, 0),
				totalPay: entries.reduce((sum, entry) => sum + entry.totalPay, 0),
			},
			error: null,
		});
	} catch (error) {
		console.log('Update payroll period error', error);

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

	const period = await prisma.payrollPeriods.findUnique({
		where: { id },
		include: {
			entries: {
				include: {
					teacher: true,
				},
			},
		},
	});

	if (!period) {
		return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 });
	}

	if (period.status === 'PAID') {
		return NextResponse.json(
			{ error: 'Cannot delete a PAID period. Reopen it to DRAFT first.', data: null },
			{ status: 400 },
		);
	}

	await prisma.payrollPeriods.delete({ where: { id } });

	return NextResponse.json({ data: period, error: null });
};

export const GET = withAuth(getDetail);
export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
