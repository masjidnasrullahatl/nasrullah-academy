import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { AddTeachersToPeriodSchema, UpsertPayrollEntriesSchema } from '../../types';

const toNumber = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

const mapEntry = (
	entry: Prisma.PayrollEntriesGetPayload<{ include: { teacher: true } }>,
) => ({
	...entry,
	hourlyRate: toNumber(entry.hourlyRate),
	weekdayHours: toNumber(entry.weekdayHours),
	weekendHours: toNumber(entry.weekendHours),
	weekdayPay: toNumber(entry.weekdayPay),
	weekendPay: toNumber(entry.weekendPay),
	totalPay: toNumber(entry.totalPay),
});

const getPeriodOrNotFound = async (periodId: string) => {
	const prisma = createClient();
	const period = await prisma.payrollPeriods.findUnique({ where: { id: periodId } });
	if (!period) {
		return null;
	}

	return period;
};

const upsertEntries = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id: periodId } = await params;
		const body = await request.json();
		const data = UpsertPayrollEntriesSchema.parse(body);

		const period = await getPeriodOrNotFound(periodId);
		if (!period) {
			return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 });
		}
		if (period.status === 'PAID') {
			return NextResponse.json(
				{ error: 'Cannot edit entries of a PAID period. Reopen to DRAFT first.', data: null },
				{ status: 400 },
			);
		}

		const prisma = createClient();
		await prisma.$transaction(
			data.entries.map((entry) => {
				const weekdayPay = entry.weekdayHours * entry.hourlyRate;
				const weekendPay = entry.weekendHours * entry.hourlyRate;
				const totalPay = weekdayPay + weekendPay;

				return prisma.payrollEntries.upsert({
					where: {
						periodId_teacherId: {
							periodId,
							teacherId: entry.teacherId,
						},
					},
					create: {
						periodId,
						teacherId: entry.teacherId,
						hourlyRate: entry.hourlyRate,
						weekdayHours: entry.weekdayHours,
						weekendHours: entry.weekendHours,
						weekdayPay,
						weekendPay,
						totalPay,
						payStatus: entry.payStatus,
						notes: entry.notes || null,
					},
					update: {
						hourlyRate: entry.hourlyRate,
						weekdayHours: entry.weekdayHours,
						weekendHours: entry.weekendHours,
						weekdayPay,
						weekendPay,
						totalPay,
						payStatus: entry.payStatus,
						notes: entry.notes || null,
					},
				});
			}),
		);

		const entries = await prisma.payrollEntries.findMany({
			where: { periodId },
			include: {
				teacher: true,
			},
			orderBy: [{ teacher: { lastName: 'asc' } }, { teacher: { firstName: 'asc' } }],
		});

		return NextResponse.json({ data: entries.map(mapEntry), error: null });
	} catch (error) {
		console.log('Upsert payroll entries error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

const addTeachers = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id: periodId } = await params;
		const body = await request.json();
		const data = AddTeachersToPeriodSchema.parse(body);

		const period = await getPeriodOrNotFound(periodId);
		if (!period) {
			return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 });
		}
		if (period.status === 'PAID') {
			return NextResponse.json(
				{ error: 'Cannot add teachers to a PAID period. Reopen to DRAFT first.', data: null },
				{ status: 400 },
			);
		}

		const prisma = createClient();
		const [teachers, existingEntries] = await Promise.all([
			prisma.teachers.findMany({
				where: {
					id: { in: data.teacherIds },
					status: 'ACTIVE',
				},
			}),
			prisma.payrollEntries.findMany({
				where: {
					periodId,
					teacherId: { in: data.teacherIds },
				},
				select: { teacherId: true },
			}),
		]);

		const existingTeacherIds = new Set(existingEntries.map((entry) => entry.teacherId));
		const creatableTeachers = teachers.filter(
			(teacher) => !existingTeacherIds.has(teacher.id),
		);

		if (creatableTeachers.length > 0) {
			await prisma.payrollEntries.createMany({
				data: creatableTeachers.map((teacher) => ({
					periodId,
					teacherId: teacher.id,
					hourlyRate: teacher.hourlyRate,
					weekdayHours: 0,
					weekendHours: 0,
					weekdayPay: 0,
					weekendPay: 0,
					totalPay: 0,
					payStatus: 'DRAFT',
				})),
			});
		}

		const entries = await prisma.payrollEntries.findMany({
			where: { periodId },
			include: {
				teacher: true,
			},
			orderBy: [{ teacher: { lastName: 'asc' } }, { teacher: { firstName: 'asc' } }],
		});

		return NextResponse.json({ data: entries.map(mapEntry), error: null });
	} catch (error) {
		console.log('Add teachers to payroll period error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

const removeEntry = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id: periodId } = await params;
	const { searchParams } = new URL(request.url);
	const entryId = searchParams.get('entryId') || '';

	if (!entryId) {
		return NextResponse.json({ error: 'entryId is required', data: null }, { status: 400 });
	}

	const period = await getPeriodOrNotFound(periodId);
	if (!period) {
		return NextResponse.json({ error: 'Payroll period not found' }, { status: 404 });
	}
	if (period.status === 'PAID') {
		return NextResponse.json(
			{ error: 'Cannot delete entry from a PAID period. Reopen to DRAFT first.', data: null },
			{ status: 400 },
		);
	}

	const prisma = createClient();
	const entry = await prisma.payrollEntries.findFirst({
		where: {
			id: entryId,
			periodId,
		},
		include: {
			teacher: true,
		},
	});

	if (!entry) {
		return NextResponse.json({ error: 'Entry not found', data: null }, { status: 404 });
	}

	await prisma.payrollEntries.delete({ where: { id: entryId } });

	return NextResponse.json({ data: mapEntry(entry), error: null });
};

export const POST = withAuth(upsertEntries);
export const PUT = withAuth(addTeachers);
export const DELETE = withAuth(removeEntry);
