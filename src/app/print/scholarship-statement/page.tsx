'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

import dayjs from 'dayjs';

import { useScholarshipStatement } from '@hooks/react-query/scholarships/useScholarshipStatement';

import { formatMoney } from '@utils/money';

const STATUS_LABELS: Record<string, string> = {
	PAID: 'Paid',
	PARTIAL: 'Partly paid',
	UNPAID: 'Not paid yet',
	NA: 'No fee due',
};

const cell = {
	border: '1px solid #ccc',
	padding: '6px 8px',
	textAlign: 'left' as const,
	fontSize: 13,
};

const headCell = { ...cell, background: '#f1f3f5', fontWeight: 600 };

const monthName = (value: string) =>
	dayjs(value.slice(0, 10)).format('MMMM YYYY');

const Statement = () => {
	const searchParams = useSearchParams();

	const year = Number(searchParams.get('year')) || undefined;
	const month = Number(searchParams.get('month')) || undefined;
	const donor = searchParams.get('donor') || '';
	const familyId = searchParams.get('familyId') || '';

	const { data, isLoading, error } = useScholarshipStatement({
		year,
		month,
		donor,
		familyId,
	});

	if (!year || !month || !donor) {
		return <p>Open this statement from Finance, Scholarships.</p>;
	}

	if (isLoading) return <p>Loading...</p>;

	if (error || !data) {
		return <p>Could not load the statement: {error?.message}</p>;
	}

	const period = dayjs(new Date(year, month - 1, 1)).format('MMMM YYYY');
	const total = data.students.reduce(
		(sum, item) => sum + item.appliedThisMonth,
		0,
	);

	return (
		<div style={{ maxWidth: 760, margin: '0 auto', padding: 32 }}>
			<style>{`
				@media print {
					.no-print { display: none !important; }
					@page { margin: 16mm; }
				}
				body { background: #fff; color: #222; }
			`}</style>

			<div className="no-print" style={{ textAlign: 'right', marginBottom: 16 }}>
				<button
					type="button"
					onClick={() => window.print()}
					style={{
						padding: '8px 16px',
						background: '#2f9e44',
						color: '#fff',
						border: 0,
						borderRadius: 4,
						cursor: 'pointer',
					}}
				>
					Print
				</button>
			</div>

			<div
				style={{
					borderBottom: '3px solid #2f9e44',
					paddingBottom: 12,
					marginBottom: 20,
				}}
			>
				<div style={{ fontSize: 22, fontWeight: 700 }}>Nasrullah Academy</div>
				<div style={{ fontSize: 13, color: '#555' }}>
					Masjid Nasrullah · Lawrenceville, GA · 470-253-9391
				</div>
			</div>

			<h1 style={{ fontSize: 24, margin: '0 0 4px' }}>
				Scholarship Statement
			</h1>
			<div style={{ fontSize: 15, marginBottom: 20 }}>
				<div>
					<b>Month:</b> {period}
				</div>
				<div>
					<b>Donor:</b> {donor}
				</div>
				{familyId && data.students[0] && (
					<div>
						<b>Family:</b> {data.students[0].familyName}
					</div>
				)}
				<div>
					<b>Issued:</b> {dayjs().format('MMMM D, YYYY')}
				</div>
			</div>

			{data.students.length === 0 ? (
				<p>No scholarships from this donor cover {period}.</p>
			) : (
				<>
					<p style={{ fontSize: 14, lineHeight: 1.5 }}>
						This statement confirms that the scholarship gift from{' '}
						<b>{donor}</b> was applied to the tuition of the following{' '}
						{data.students.length === 1 ? 'student' : 'students'} at
						Nasrullah Academy for <b>{period}</b>.
					</p>

					<table
						style={{
							width: '100%',
							borderCollapse: 'collapse',
							marginBottom: 20,
						}}
					>
						<thead>
							<tr>
								<th style={headCell}>Student</th>
								<th style={headCell}>Family</th>
								<th style={headCell}>Program</th>
								<th style={headCell}>Scholarship covers</th>
								<th style={{ ...headCell, textAlign: 'right' }}>
									Applied for {dayjs(new Date(year, month - 1, 1)).format('MMMM')}
								</th>
							</tr>
						</thead>
						<tbody>
							{data.students.map((item) => {
								const first = monthName(item.startMonth);
								const last = item.endMonth ? monthName(item.endMonth) : first;

								return (
									<tr key={item.id}>
										<td style={cell}>{item.studentName}</td>
										<td style={cell}>{item.familyName}</td>
										<td style={cell}>{item.programs.join(', ') || '-'}</td>
										<td style={cell}>
											{first === last ? first : `${first} to ${last}`}
										</td>
										<td style={{ ...cell, textAlign: 'right' }}>
											{formatMoney(item.appliedThisMonth)}
										</td>
									</tr>
								);
							})}
							<tr>
								<td style={{ ...headCell }} colSpan={4}>
									Total applied for {period}
								</td>
								<td style={{ ...headCell, textAlign: 'right' }}>
									{formatMoney(total)}
								</td>
							</tr>
						</tbody>
					</table>

					<h2 style={{ fontSize: 16, margin: '0 0 8px' }}>
						Tuition record for {period}
					</h2>
					{data.payments.length === 0 ? (
						<p style={{ fontSize: 14 }}>
							The tuition record for this month has not been created yet.
						</p>
					) : (
						<table
							style={{
								width: '100%',
								borderCollapse: 'collapse',
								marginBottom: 20,
							}}
						>
							<thead>
								<tr>
									<th style={headCell}>Family</th>
									<th style={headCell}>Program</th>
									<th style={{ ...headCell, textAlign: 'right' }}>
										Tuition due
									</th>
									<th style={{ ...headCell, textAlign: 'right' }}>Paid</th>
									<th style={headCell}>Status</th>
									<th style={headCell}>Date paid</th>
								</tr>
							</thead>
							<tbody>
								{data.payments.map((item) => (
									<tr key={item.id}>
										<td style={cell}>{item.familyName}</td>
										<td style={cell}>{item.programName}</td>
										<td style={{ ...cell, textAlign: 'right' }}>
											{formatMoney(item.totalDue)}
										</td>
										<td style={{ ...cell, textAlign: 'right' }}>
											{formatMoney(item.totalPaid)}
										</td>
										<td style={cell}>
											{STATUS_LABELS[item.paymentStatus] || item.paymentStatus}
										</td>
										<td style={cell}>
											{item.paidAt ? dayjs(item.paidAt).format('MM/DD/YYYY') : '-'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</>
			)}

			<p style={{ fontSize: 14, lineHeight: 1.5 }}>
				JazakAllahu khairan for supporting the education of our students. May
				Allah accept it from you.
			</p>

			<div style={{ marginTop: 48, display: 'flex', gap: 48 }}>
				<div style={{ flex: 1 }}>
					<div style={{ borderTop: '1px solid #222', paddingTop: 4, fontSize: 13 }}>
						Authorized signature
					</div>
				</div>
				<div style={{ flex: 1 }}>
					<div style={{ borderTop: '1px solid #222', paddingTop: 4, fontSize: 13 }}>
						Date
					</div>
				</div>
			</div>
		</div>
	);
};

export default function ScholarshipStatementPage() {
	return (
		<>
			<title>Scholarship Statement | Nasrullah Academy</title>
			<Suspense fallback={<p>Loading...</p>}>
				<Statement />
			</Suspense>
		</>
	);
}
