import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import sumBy from 'lodash/sumBy';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const prisma = createClient();

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 20);
	const payPeriodId = searchParams.get('payPeriodId') || '';
	const teacherId = searchParams.get('teacherId') || '';

	const skip = (page - 1) * limit;

	const where: Prisma.PayRecordsWhereInput = {};

	if (payPeriodId) where.payPeriodId = payPeriodId;
	if (teacherId) where.teacherId = teacherId;

	const getTotalQuery = prisma.payRecords.count({ where });
	const getRecordsQuery = prisma.payRecords.findMany({
		where,
		skip,
		take: limit,
		include: {
			teacher: { select: { id: true, firstName: true, lastName: true } },
			payPeriod: {
				select: {
					id: true,
					name: true,
					startDate: true,
					endDate: true,
					status: true,
				},
			},
		},
		orderBy: [
			{ payPeriod: { endDate: 'desc' } },
			{ teacher: { lastName: 'asc' } },
		],
	});

	const [total, records] = await Promise.all([getTotalQuery, getRecordsQuery]);

	const data = records.map((record) => ({
		...record,
		totalHours: Number(record.totalHours),
		hourlyRate: Number(record.hourlyRate),
		totalPay: Number(record.totalPay),
	}));

	const summary = {
		totalHours: sumBy(data, 'totalHours'),
		totalPay: sumBy(data, 'totalPay'),
	};
	return NextResponse.json({ data, total, summary, error: null });
};

export const GET = withStaff(getPaging);
