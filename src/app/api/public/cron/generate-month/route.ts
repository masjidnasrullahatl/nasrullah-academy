import { NextRequest, NextResponse } from 'next/server';

import { generateMonth } from '@app/api/invoices/generateMonth';

import { createClient } from '@helpers/prisma/server';

// The school's month, not the server's (which runs on UTC)
const currentSchoolMonth = () => {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		year: 'numeric',
		month: 'numeric',
	}).formatToParts(new Date());

	const value = (type: string) =>
		Number(parts.find((part) => part.type === type)?.value);

	return { year: value('year'), month: value('month') };
};

/**
 * Runs every day (vercel.json): makes sure this month has a payment row for
 * every active family. Unpaid until a card payment or staff marks it paid;
 * existing rows are never changed.
 */
export async function GET(request: NextRequest) {
	const secret = process.env.CRON_SECRET;
	const isAllowed = secret
		? request.headers.get('authorization') === `Bearer ${secret}`
		: (request.headers.get('user-agent') || '').startsWith('vercel-cron');

	if (!isAllowed) {
		return NextResponse.json({ error: 'Not allowed' }, { status: 401 });
	}

	try {
		const { year, month } = currentSchoolMonth();
		const result = await generateMonth(createClient(), year, month);

		return NextResponse.json({ data: { year, month, ...result }, error: null });
	} catch (error) {
		console.log('Generate month cron error', error);

		return NextResponse.json(
			{ error: 'Unable to generate the month' },
			{ status: 500 },
		);
	}
}
