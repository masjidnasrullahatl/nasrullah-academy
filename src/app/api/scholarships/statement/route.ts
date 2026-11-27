import { NextResponse } from 'next/server';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { badRequest, internalServerError } from '../../utils/response';
import { mapScholarship, scholarshipInclude } from '../utils';

const monthsBetween = (start: Date, end: Date) =>
	(end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
	(end.getUTCMonth() - start.getUTCMonth()) +
	1;

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * A donor's scholarships for one month, with each family's payment record
 * for that month, for the printable donor statement.
 */
const getStatement = async (request: AuthRequest) => {
	try {
		const { searchParams } = new URL(request.url);

		const year = Number(searchParams.get('year'));
		const month = Number(searchParams.get('month'));
		const donor = (searchParams.get('donor') || '').trim();
		const familyId = (searchParams.get('familyId') || '').trim();

		if (!year || !month || month < 1 || month > 12) {
			return badRequest('Choose a month');
		}

		const monthStart = new Date(Date.UTC(year, month - 1, 1));

		const prisma = createClient();

		const active = await prisma.scholarships.findMany({
			where: {
				startMonth: { lte: monthStart },
				OR: [{ endMonth: null }, { endMonth: { gte: monthStart } }],
			},
			include: scholarshipInclude,
			orderBy: [{ createdAt: 'asc' }],
		});

		const donors = [
			...new Set(active.map((item) => item.donorName?.trim() || '')),
		]
			.filter(Boolean)
			.sort();

		const donorScholarships = active
			.filter(
				(item) =>
					!donor ||
					(item.donorName || '').trim().toLowerCase() === donor.toLowerCase(),
			)
			.map(mapScholarship);

		// the families this donor covers this month, to print one family per page
		const families = [
			...new Map(
				donorScholarships.map((item) => [
					item.student.family.id,
					{ id: item.student.family.id, name: item.student.family.name },
				]),
			).values(),
		].sort((a, b) => a.name.localeCompare(b.name));

		const scholarships = familyId
			? donorScholarships.filter((item) => item.student.family.id === familyId)
			: donorScholarships;

		const students = scholarships.map((item) => {
			const months = item.endMonth
				? Math.max(monthsBetween(item.startMonth, item.endMonth), 1)
				: 1;

			return {
				id: item.id,
				studentName: `${item.student.firstName} ${item.student.lastName}`,
				familyId: item.student.family.id,
				familyName: item.student.family.name,
				programs: item.student.programs.map((program) => program.name),
				donorName: item.donorName,
				amountReceived: item.amountReceived,
				receivedAt: item.receivedAt,
				startMonth: item.startMonth,
				endMonth: item.endMonth,
				months,
				// the share of the gift that covers this one month
				appliedThisMonth: round2(item.amountReceived / months),
			};
		});

		const familyIds = [...new Set(students.map((item) => item.familyId))];

		const invoices = familyIds.length
			? await prisma.monthlyInvoices.findMany({
					where: { year, month, familyId: { in: familyIds } },
					include: {
						family: { select: { name: true } },
						program: { select: { name: true } },
					},
					orderBy: [{ family: { name: 'asc' } }],
				})
			: [];

		const payments = invoices.map((invoice) => ({
			id: invoice.id,
			familyName: invoice.family.name,
			programName: invoice.program.name,
			totalDue: Number(invoice.totalDue),
			totalPaid: Number(invoice.totalPaid),
			balance: Number(invoice.balance),
			payMethod: invoice.payMethod,
			paymentStatus: invoice.paymentStatus,
			paidAt: invoice.paidAt,
			notes: invoice.notes,
		}));

		return NextResponse.json({
			data: { year, month, donor, donors, families, students, payments },
			error: null,
		});
	} catch (error) {
		console.log('Scholarship statement error', error);

		return internalServerError();
	}
};

export const GET = withStaff(getStatement);
