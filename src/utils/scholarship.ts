export type ScholarshipStatus = 'UPCOMING' | 'CURRENT' | 'ENDED';

// Months as one running number, so calendar dates never shift with time zones.
// Values start with YYYY-MM.
const toIndex = (value: string) =>
	Number(value.slice(0, 4)) * 12 + Number(value.slice(5, 7)) - 1;

/** Where a scholarship stands, from the months it covers. */
export const getScholarshipStatus = (
	startMonth: string,
	endMonth: string | null,
	today = new Date(),
): ScholarshipStatus => {
	const current = today.getFullYear() * 12 + today.getMonth();

	if (current < toIndex(startMonth)) return 'UPCOMING';

	return endMonth && current > toIndex(endMonth) ? 'ENDED' : 'CURRENT';
};

export const isScholarshipCurrent = (
	startMonth: string,
	endMonth: string | null,
) => getScholarshipStatus(startMonth, endMonth) !== 'ENDED';
