import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { CreateTimeEntrySchema } from './types';

const normalizeDate = (value: Date) => {
	const normalized = new Date(value);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};

const includeOptions = {
	teacher: {
		select: { id: true, firstName: true, lastName: true },
	},
	class: {
		select: {
			id: true,
			name: true,
			program: { select: { id: true, name: true } },
		},
	},
	payPeriod: {
		select: {
			id: true,
			name: true,
			status: true,
			startDate: true,
			endDate: true,
		},
	},
};

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const payPeriodId = searchParams.get('payPeriodId') || '';
	const teacherId = searchParams.get('teacherId') || '';

	const prisma = createClient();
	const skip = (page - 1) * limit;

	const where: Prisma.TimeEntriesWhereInput = {};

	if (payPeriodId) where.payPeriodId = payPeriodId;

	if (teacherId) where.teacherId = teacherId;

	const total = await prisma.timeEntries.count({ where });

	const entries = await prisma.timeEntries.findMany({
		where,
		skip,
		take: limit,
		include: includeOptions,
		orderBy: [{ teacher: { lastName: 'asc' } }, { date: 'asc' }],
	});

	const data = entries.map((entry) => ({
		...entry,
		hours: Number(entry.hours),
	}));

	return NextResponse.json({ data, total, error: null });
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const payload = CreateTimeEntrySchema.parse(body);
		const prisma = createClient();

		const [teacher, classItem, payPeriod] = await Promise.all([
			prisma.teachers.findUnique({ where: { id: payload.teacherId } }),
			prisma.classes.findUnique({ where: { id: payload.classId } }),
			prisma.payPeriods.findUnique({ where: { id: payload.payPeriodId } }),
		]);

		if (!teacher) return notFound('Teacher not found');

		if (teacher.status !== 'ACTIVE') {
			return badRequest('Teacher must be ACTIVE');
		}

		if (!classItem || classItem.teacherId !== payload.teacherId) {
			return badRequest('Class must belong to the selected teacher');
		}

		if (!payPeriod) return notFound('Pay period not found');

		if (payPeriod.status !== 'OPEN') {
			return badRequest('Cannot create time entry. Pay period is not open');
		}

		const entryDate = normalizeDate(payload.date);
		const startDate = normalizeDate(payPeriod.startDate);
		const endDate = normalizeDate(payPeriod.endDate);

		if (entryDate < startDate || entryDate > endDate) {
			return badRequest('Date must be within pay period range');
		}

		const entry = await prisma.timeEntries.create({
			data: {
				date: entryDate,
				hours: payload.hours,
				notes: payload.notes || null,
				teacherId: payload.teacherId,
				classId: payload.classId,
				payPeriodId: payload.payPeriodId,
			},
			include: includeOptions,
		});

		return success({
			...entry,
			hours: Number(entry.hours),
		});
	} catch (error) {
		if (error instanceof ZodError) return catchZodError(error);

		console.log('Create staff time entry error', error);
		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
