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

export const STUDENT_STATUS_OPTIONS = [
	{ value: 'ACTIVE', label: 'Current students' },
	{ value: 'INACTIVE', label: 'Former students' },
];

type SummaryRow = MilestoneLike & {
	studentId: string;
	student: { status: string };
};

export type MilestoneSummaryItem = {
	label: string;
	current: number;
	former: number;
	total: number;
};

// How many students reached each milestone: Juz 30 down to Juz 1, then books
export const summarizeMilestones = (rows: SummaryRow[]) => {
	const groups = new Map<
		string,
		{ label: string; order: string; current: Set<string>; former: Set<string> }
	>();

	rows.forEach((row) => {
		const key =
			row.type === 'JUZ' ? `juz-${row.juzNumber}` : `book-${row.bookName}`;
		const group = groups.get(key) ?? {
			label:
				row.type === 'JUZ' ? `Juz ${row.juzNumber}` : String(row.bookName),
			order:
				row.type === 'JUZ'
					? `0-${String(JUZ_COUNT - (row.juzNumber ?? 0)).padStart(2, '0')}`
					: `1-${row.bookName}`,
			current: new Set<string>(),
			former: new Set<string>(),
		};

		(row.student.status === 'INACTIVE' ? group.former : group.current).add(
			row.studentId,
		);
		groups.set(key, group);
	});

	return [...groups.values()]
		.sort((a, b) => a.order.localeCompare(b.order))
		.map<MilestoneSummaryItem>((group) => ({
			label: group.label,
			current: group.current.size,
			former: group.former.size,
			total: group.current.size + group.former.size,
		}));
};
