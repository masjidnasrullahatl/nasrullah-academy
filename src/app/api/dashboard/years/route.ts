import { NextResponse } from 'next/server';

import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

const getYears = async () => {
	const prisma = createClient();
	const currentYear = new Date().getFullYear();

	const years = await prisma.monthlyInvoices.findMany({
		distinct: ['year'],
		select: { year: true },
		orderBy: { year: 'desc' },
	});

	const yearSet = new Set(years.map((item) => item.year));
	yearSet.add(currentYear);

	const data = Array.from(yearSet).sort((a, b) => b - a);

	return NextResponse.json({ data, error: null });
};

export const GET = withAuth(getYears);
