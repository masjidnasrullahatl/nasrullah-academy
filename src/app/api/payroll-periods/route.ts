import { NextResponse } from 'next/server';

import { PayrollStatus, Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { CreatePayrollPeriodSchema } from './types';

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

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);
	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const year = Number(searchParams.get('year') || 0);
	const month = Number(searchParams.get('month') || 0);
	const status = searchParams.get('status') || '';
	const keyword = searchParams.get('keyword') || '';

	const skip = (page - 1) * limit;
	const where: Prisma.PayrollPeriodsWhereInput = {};

	if (year) {
		where.year = year;
	}
	if (month) {
		where.month = month;
	}
	if (status) {
		where.status = status as PayrollStatus;
	}
	if (keyword) {
		where.OR = [
			{ label: { contains: keyword, mode: 'insensitive' } },
			{ notes: { contains: keyword, mode: 'insensitive' } },
		];
	}

	const prisma = createClient();
	const [total, periods] = await Promise.all([
		prisma.payrollPeriods.count({ where }),
		prisma.payrollPeriods.findMany({
			where,
			skip,
			take: limit,
			include: {
				entries: {
					include: {
						teacher: true,
					},
				},
			},
			orderBy: [{ year: 'desc' }, { month: 'desc' }, { startDate: 'desc' }],
		}),
	]);

	return NextResponse.json({
		data: periods.map((period) => {
			const entries = period.entries.map(mapEntry);
			return {
				...period,
				entries,
				teacherCount: entries.length,
				totalWeekdayPay: entries.reduce((sum, entry) => sum + entry.weekdayPay, 0),
				totalWeekendPay: entries.reduce((sum, entry) => sum + entry.weekendPay, 0),
				totalPay: entries.reduce((sum, entry) => sum + entry.totalPay, 0),
			};
		}),
		total,
		error: null,
	});
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = CreatePayrollPeriodSchema.parse(body);
		const prisma = createClient();

		const period = await prisma.payrollPeriods.create({
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
				},
			},
		});

		return NextResponse.json(
			{
				data: {
					...period,
					entries: period.entries.map(mapEntry),
					teacherCount: 0,
					totalWeekdayPay: 0,
					totalWeekendPay: 0,
					totalPay: 0,
				},
				error: null,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.log('Create payroll period error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

export const GET = withAuth(getPaging);
export const POST = withAuth(create);
