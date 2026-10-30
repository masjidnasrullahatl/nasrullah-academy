import dayjs from 'dayjs';

export type ScholarshipTerms = {
	amountReceived: number;
	monthlyAmount: number;
	// first of the month, YYYY-MM-DD at the start of the value
	startMonth: string;
	endMonth: string | null;
};

export type ScholarshipStatus = 'UPCOMING' | 'ACTIVE' | 'ENDING_SOON' | 'ENDED';

// Months as one running number, so calendar dates never shift with time zones
const toIndex = (value: string) =>
	Number(value.slice(0, 4)) * 12 + Number(value.slice(5, 7)) - 1;

const indexLabel = (index: number) =>
	dayjs(new Date(Math.floor(index / 12), index % 12, 1)).format('MMMM YYYY');

/**
 * Where a scholarship stands today. The money pays one monthly amount per
 * month from the start month, until it runs out or the end month is reached.
 */
export const getScholarshipProgress = (
	terms: ScholarshipTerms,
	today = new Date(),
) => {
	const { amountReceived, monthlyAmount } = terms;

	const start = toIndex(terms.startMonth);
	const current = today.getFullYear() * 12 + today.getMonth();
	const paidMonths =
		monthlyAmount > 0 ? Math.floor(amountReceived / monthlyAmount) : 0;
	const lastPaid = start + paidMonths - 1;
	const last = terms.endMonth
		? Math.min(toIndex(terms.endMonth), lastPaid)
		: lastPaid;

	const monthsUsed = Math.min(
		Math.max(current - start + 1, 0),
		Math.max(last - start + 1, 0),
	);
	const used = Math.round(monthsUsed * monthlyAmount * 100) / 100;

	let status: ScholarshipStatus = 'ACTIVE';

	if (current > last) status = 'ENDED';
	else if (current < start) status = 'UPCOMING';
	else if (last - current <= 1) status = 'ENDING_SOON';

	return {
		used,
		remaining: Math.round((amountReceived - used) * 100) / 100,
		coveredThrough: last >= start ? indexLabel(last) : null,
		status,
	};
};

export const isScholarshipCurrent = (terms: ScholarshipTerms) =>
	getScholarshipProgress(terms).status !== 'ENDED';
