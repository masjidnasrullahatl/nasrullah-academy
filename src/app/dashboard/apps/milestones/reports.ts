import { MilestoneRow } from '@hooks/react-query/milestones/useGetPagingMilestones';

import { escapeHtml } from '@utils/printReport';

import { formatCompletedAt, getMilestoneLabel, JUZ_COUNT } from './utils';

type ReportStudent = {
	firstName: string;
	lastName: string;
	family?: { name: string } | null;
	programs?: Array<{ name: string }>;
};

const countBy = (rows: MilestoneRow[]) => ({
	juz: rows.filter((row) => row.type === 'JUZ').length,
	books: rows.filter((row) => row.type === 'BOOK').length,
	students: new Set(rows.map((row) => row.studentId)).size,
});

export const buildMilestonesReport = (
	rows: MilestoneRow[],
	filters: string[],
) => {
	const totals = countBy(rows);

	const tableRows = rows
		.map(
			(row, index) => `<tr>
				<td>${index + 1}</td>
				<td>${escapeHtml(formatCompletedAt(row.completedAt))}</td>
				<td>${escapeHtml(`${row.student.firstName} ${row.student.lastName}`)}</td>
				<td>${escapeHtml(row.student.family.name)}</td>
				<td>${escapeHtml(row.student.programs.map((program) => program.name).join(', '))}</td>
				<td>${escapeHtml(getMilestoneLabel(row))}</td>
				<td>${escapeHtml(row.notes || '')}</td>
			</tr>`,
		)
		.join('');

	return `
		<header>
			<h1>Nasrullah Academy · Milestones Report</h1>
			<div class="meta muted">
				${filters.length ? filters.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>All milestones</span>'}
			</div>
		</header>
		<div class="stats">
			<div class="stat"><b>${totals.juz}</b>Juz memorized</div>
			<div class="stat"><b>${totals.books}</b>Books completed</div>
			<div class="stat"><b>${totals.students}</b>Students</div>
		</div>
		<table>
			<thead>
				<tr><th>#</th><th>Date</th><th>Student</th><th>Family</th><th>Programs</th><th>Milestone</th><th>Notes</th></tr>
			</thead>
			<tbody>${tableRows || '<tr><td colspan="7" class="muted">No milestones found</td></tr>'}</tbody>
		</table>`;
};

export const buildStudentReport = (
	student: ReportStudent,
	rows: MilestoneRow[],
) => {
	const juzByNumber = new Map(
		rows.filter((row) => row.type === 'JUZ').map((row) => [row.juzNumber, row]),
	);
	const books = rows.filter((row) => row.type === 'BOOK');

	const juzCells = Array.from({ length: JUZ_COUNT }, (_, index) => {
		const done = juzByNumber.get(index + 1);

		return `<div class="juz${done ? ' done' : ''}">
			<b>${index + 1}</b>
			<small>${done ? escapeHtml(formatCompletedAt(done.completedAt)) : '&nbsp;'}</small>
		</div>`;
	}).join('');

	const bookRows = books
		.map(
			(book) => `<tr>
				<td>${escapeHtml(book.bookName)}</td>
				<td>${escapeHtml(formatCompletedAt(book.completedAt))}</td>
				<td>${escapeHtml(book.notes || '')}</td>
			</tr>`,
		)
		.join('');

	return `
		<header>
			<h1>${escapeHtml(`${student.firstName} ${student.lastName}`)} · Progress Report</h1>
			<div class="meta muted">
				<span>Family: ${escapeHtml(student.family?.name || '-')}</span>
				<span>Programs: ${escapeHtml(student.programs?.map((program) => program.name).join(', ') || '-')}</span>
			</div>
		</header>
		<div class="stats">
			<div class="stat"><b>${juzByNumber.size} / ${JUZ_COUNT}</b>Juz memorized</div>
			<div class="stat"><b>${books.length}</b>Books completed</div>
		</div>
		<h2>Juz memorized</h2>
		<div class="juz-grid">${juzCells}</div>
		<h2>Books completed</h2>
		<table>
			<thead><tr><th>Book</th><th>Completed on</th><th>Notes</th></tr></thead>
			<tbody>${bookRows || '<tr><td colspan="3" class="muted">No books completed yet</td></tr>'}</tbody>
		</table>`;
};
