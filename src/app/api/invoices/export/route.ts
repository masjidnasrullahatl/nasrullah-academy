import { NextResponse } from 'next/server';

import { PaymentStatus, PayMethod, Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

const toNumber = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

const buildWhere = (searchParams: URLSearchParams): Prisma.MonthlyInvoicesWhereInput => {
	const year = Number(searchParams.get('year') || 0);
	const month = Number(searchParams.get('month') || 0);
	const keyword = searchParams.get('keyword') || '';
	const programId = searchParams.get('programId') || '';
	const paymentStatus = searchParams.get('paymentStatus') || '';
	const payMethod = searchParams.get('payMethod') || '';
	const familyId = searchParams.get('familyId') || '';

	const where: Prisma.MonthlyInvoicesWhereInput = {};

	if (year) {
		where.year = year;
	}
	if (month) {
		where.month = month;
	}
	if (programId) {
		where.programId = programId;
	}
	if (familyId) {
		where.familyId = familyId;
	}
	if (paymentStatus) {
		where.paymentStatus = paymentStatus as PaymentStatus;
	}
	if (payMethod) {
		where.payMethod = payMethod as PayMethod;
	}
	if (keyword) {
		where.family = {
			OR: [
				{ name: { contains: keyword, mode: 'insensitive' } },
				{ primaryPhone: { contains: keyword, mode: 'insensitive' } },
				{ fatherName: { contains: keyword, mode: 'insensitive' } },
				{ motherName: { contains: keyword, mode: 'insensitive' } },
			],
		};
	}

	return where;
};

const exportInvoices = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);
	const where = buildWhere(searchParams);
	const prisma = createClient();

	const [invoices, aggregate] = await Promise.all([
		prisma.monthlyInvoices.findMany({
			where,
			include: {
				family: true,
				program: true,
			},
			orderBy: [{ family: { name: 'asc' } }],
		}),
		prisma.monthlyInvoices.aggregate({
			where,
			_sum: {
				studentCount: true,
				registrationFee: true,
				tuitionFee: true,
				bookFee: true,
				totalDue: true,
				paidRegistrationFee: true,
				paidTuitionFee: true,
				paidBookFee: true,
				extraPaid: true,
				totalPaid: true,
				balance: true,
			},
		}),
	]);

	const familyIds = Array.from(new Set(invoices.map((invoice) => invoice.familyId)));
	const programIds = Array.from(new Set(invoices.map((invoice) => invoice.programId)));

	const students = familyIds.length
		? await prisma.students.findMany({
				where: {
					status: 'ACTIVE',
					familyId: { in: familyIds },
					enrollments: {
						some: {
							status: 'ACTIVE',
							programId: { in: programIds },
						},
					},
				},
				select: {
					familyId: true,
					gender: true,
					enrollments: {
						where: {
							status: 'ACTIVE',
							programId: { in: programIds },
						},
						select: {
							programId: true,
						},
					},
				},
			})
		: [];

	const genderMap = new Map<string, { boys: number; girls: number }>();
	for (const student of students) {
		const enrolledPrograms = Array.from(
			new Set(student.enrollments.map((enrollment) => enrollment.programId)),
		);
		for (const currentProgramId of enrolledPrograms) {
			const key = `${student.familyId}-${currentProgramId}`;
			const current = genderMap.get(key) || { boys: 0, girls: 0 };
			if (student.gender === 'BOY') {
				current.boys += 1;
			} else {
				current.girls += 1;
			}
			genderMap.set(key, current);
		}
	}

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Payments');
	sheet.views = [{ state: 'frozen', ySplit: 1 }];

	sheet.columns = [
		{ header: 'Parent / Students name', key: 'familyName', width: 24 },
		{ header: 'Phone Number', key: 'phoneNumber', width: 18 },
		{ header: 'Student Status', key: 'studentStatus', width: 16 },
		{ header: '#Kids', key: 'studentCount', width: 8 },
		{ header: 'Registration fees', key: 'registrationFee', width: 16 },
		{ header: 'Hifz Price / Weekends Price', key: 'tuitionFee', width: 24 },
		{ header: 'Books Fees', key: 'bookFee', width: 14 },
		{ header: 'Time (Weekend only)', key: 'session', width: 18 },
		{ header: 'Total Amount Due', key: 'totalDue', width: 16 },
		{ header: 'Paid Registration fees', key: 'paidRegistrationFee', width: 20 },
		{ header: 'Paid Hifz/Weekends Fees', key: 'paidTuitionFee', width: 22 },
		{ header: 'Books Fees Paid', key: 'paidBookFee', width: 16 },
		{ header: 'Extra Amount Paid', key: 'extraPaid', width: 16 },
		{ header: 'Total Amount Paid', key: 'totalPaid', width: 16 },
		{ header: 'Balance', key: 'balance', width: 14 },
		{ header: 'Date', key: 'paidAt', width: 14 },
		{ header: 'Pay Method', key: 'payMethod', width: 14 },
		{ header: 'Payment Status', key: 'paymentStatus', width: 16 },
		{ header: 'Notes', key: 'notes', width: 24 },
		{ header: 'Boys / Girls', key: 'boysGirls', width: 14 },
	];

	sheet.getRow(1).font = { bold: true };

	for (const invoice of invoices) {
		const boysGirls = genderMap.get(`${invoice.familyId}-${invoice.programId}`) || {
			boys: 0,
			girls: 0,
		};
		sheet.addRow({
			familyName: invoice.family.name,
			phoneNumber: invoice.family.primaryPhone,
			studentStatus: invoice.family.status,
			studentCount: invoice.studentCount,
			registrationFee: toNumber(invoice.registrationFee),
			tuitionFee: toNumber(invoice.tuitionFee),
			bookFee: toNumber(invoice.bookFee),
			session: invoice.session || 'NA',
			totalDue: toNumber(invoice.totalDue),
			paidRegistrationFee: toNumber(invoice.paidRegistrationFee),
			paidTuitionFee: toNumber(invoice.paidTuitionFee),
			paidBookFee: toNumber(invoice.paidBookFee),
			extraPaid: toNumber(invoice.extraPaid),
			totalPaid: toNumber(invoice.totalPaid),
			balance: toNumber(invoice.balance),
			paidAt: invoice.paidAt ? invoice.paidAt.toISOString().slice(0, 10) : '',
			payMethod: invoice.payMethod,
			paymentStatus: invoice.paymentStatus,
			notes: invoice.notes || '',
			boysGirls: `${boysGirls.boys} / ${boysGirls.girls}`,
		});
	}

	const sumRow = sheet.addRow({
		familyName: 'Sum:',
		studentCount: Number(aggregate._sum.studentCount || 0),
		registrationFee: toNumber(aggregate._sum.registrationFee),
		tuitionFee: toNumber(aggregate._sum.tuitionFee),
		bookFee: toNumber(aggregate._sum.bookFee),
		totalDue: toNumber(aggregate._sum.totalDue),
		paidRegistrationFee: toNumber(aggregate._sum.paidRegistrationFee),
		paidTuitionFee: toNumber(aggregate._sum.paidTuitionFee),
		paidBookFee: toNumber(aggregate._sum.paidBookFee),
		extraPaid: toNumber(aggregate._sum.extraPaid),
		totalPaid: toNumber(aggregate._sum.totalPaid),
		balance: toNumber(aggregate._sum.balance),
	});
	sumRow.font = { bold: true };

	const currencyColumns = [5, 6, 7, 9, 10, 11, 12, 13, 14, 15];
	for (const columnIndex of currencyColumns) {
		sheet.getColumn(columnIndex).numFmt = '"$"#,##0.00';
	}

	const year = searchParams.get('year') || 'all';
	const month = searchParams.get('month') || 'all';
	const program = searchParams.get('programId') || 'all';
	const fileName = `payments-${year}-${month}-${program}.xlsx`;

	const buffer = await workbook.xlsx.writeBuffer();

	return new NextResponse(buffer, {
		headers: {
			'Content-Type':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="${fileName}"`,
		},
	});
};

export const GET = withAuth(exportInvoices);
