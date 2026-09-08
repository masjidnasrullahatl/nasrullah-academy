import { AuthRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../utils';

import { CreateTimeEntrySchema } from './types';

const normalizeDate = (value: Date) => {
	const normalized = new Date(value);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};

const getMyTimeEntries = async (request: AuthRequest) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) return notFound('Teacher profile not found');

	const { searchParams } = new URL(request.url);
	const payPeriodId = searchParams.get('payPeriodId') || '';

	const prisma = createClient();

	const where = {
		teacherId: teacher.id,
		...(payPeriodId ? { payPeriodId } : {}),
	};

	const getEntriesQuery = prisma.timeEntries.findMany({
		where,
		orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
		include: {
			class: {
				select: { id: true, name: true, program: { select: { name: true } } },
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
		},
	});

	const getTotalEntriesTotalQuery = prisma.timeEntries.count({ where });

	const getSubmissionQuery = payPeriodId
		? prisma.teacherSubmissions.findUnique({
				where: {
					teacherId_payPeriodId: { teacherId: teacher.id, payPeriodId },
				},
			})
		: null;

	const [entries, total, submission] = await Promise.all([
		getEntriesQuery,
		getTotalEntriesTotalQuery,
		getSubmissionQuery,
	]);

	const data = entries.map((entry) => ({
		...entry,
		hours: Number(entry.hours),
	}));

	return success({
		data,
		total,
		submittedAt: submission?.submittedAt || null,
	});
};

const createMyTimeEntry = async (request: AuthRequest) => {
	try {
		const teacher = await getCurrentTeacher(request.user.id);

		if (!teacher) return notFound('Teacher profile not found');

		const body = await request.json();
		const payload = CreateTimeEntrySchema.parse(body);

		const prisma = createClient();
		const [classItem, payPeriod] = await Promise.all([
			prisma.classes.findFirst({
				where: {
					id: payload.classId,
					teacherId: teacher.id,
					status: 'ACTIVE',
				},
			}),
			prisma.payPeriods.findUnique({ where: { id: payload.payPeriodId } }),
		]);

		if (!classItem) {
			return badRequest(
				'Invalid class. You can only log hours for your classes',
			);
		}

		if (!payPeriod) return notFound('Pay period not found');

		if (payPeriod.status !== 'OPEN') {
			return badRequest('Cannot add time entry. Pay period is not open');
		}

		const submission = await prisma.teacherSubmissions.findUnique({
			where: {
				teacherId_payPeriodId: {
					teacherId: teacher.id,
					payPeriodId: payload.payPeriodId,
				},
			},
		});

		if (submission) {
			return badRequest('Hours already submitted for this pay period');
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
				teacherId: teacher.id,
				classId: payload.classId,
				payPeriodId: payload.payPeriodId,
			},
			include: {
				class: {
					select: { id: true, name: true, program: { select: { name: true } } },
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
			},
		});

		return success({ ...entry, hours: Number(entry.hours) });
	} catch (error) {
		console.log('Create my time entry error', error);
		return internalServerError();
	}
};

export const GET = withAuth(getMyTimeEntries);
export const POST = withAuth(createMyTimeEntry);
