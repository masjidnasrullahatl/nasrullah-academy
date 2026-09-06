import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { internalServerError, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { CreatePayPeriodSchema } from './types';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const status = searchParams.get('status') || '';

	const prisma = createClient();
	const skip = (page - 1) * limit;

	const where: Prisma.PayPeriodsWhereInput = {};

	if (keyword) where.name = { contains: keyword, mode: 'insensitive' };

	if (status) where.status = status as any;

	const total = await prisma.payPeriods.count({ where });

	const data = await prisma.payPeriods.findMany({
		where,
		skip,
		take: limit,
		orderBy: [{ startDate: 'desc' }, { endDate: 'desc' }],
		include: {
			_count: {
				select: { timeEntries: true, payRecords: true, submissions: true },
			},
		},
	});

	return NextResponse.json({ data, total, error: null });
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const payload = CreatePayPeriodSchema.parse(body);

		const prisma = createClient();
		const payPeriod = await prisma.payPeriods.create({
			data: {
				name: payload.name,
				startDate: payload.startDate,
				endDate: payload.endDate,
			},
			include: {
				_count: {
					select: { timeEntries: true, payRecords: true, submissions: true },
				},
			},
		});

		return success(payPeriod);
	} catch (error) {
		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		console.log('Create pay period error', error);
		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
