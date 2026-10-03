import { MilestoneType } from '@prisma/client';
import dayjs from 'dayjs';

export const JUZ_COUNT = 30;

export const MILESTONE_TYPE_OPTIONS: { value: MilestoneType; label: string }[] =
	[
		{ value: 'JUZ', label: 'Juz memorized' },
		{ value: 'BOOK', label: 'Book completed' },
	];

export const JUZ_OPTIONS = Array.from({ length: JUZ_COUNT }, (_, index) => ({
	value: String(index + 1),
	label: `Juz ${index + 1}`,
}));

type MilestoneLike = {
	type: MilestoneType;
	juzNumber: number | null;
	bookName: string | null;
};

export const getMilestoneLabel = (milestone: MilestoneLike) =>
	milestone.type === 'JUZ'
		? `Juz ${milestone.juzNumber} memorized`
		: `Completed ${milestone.bookName}`;

// completedAt is a calendar date; read only the YYYY-MM-DD part so the
// browser's time zone never shifts it to the previous day.
export const parseCompletedAt = (value: string) =>
	dayjs(value.slice(0, 10)).toDate();

export const formatCompletedAt = (value: string) =>
	dayjs(value.slice(0, 10)).format('MM/DD/YYYY');
