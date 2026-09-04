import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { UpdateTimeEntrySchema } from '../types';

const normalizeDate = (value: Date) => {
	const normalized = new Date(value);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};

const includeOptions = {
	teacher: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
		},
	},
	class: {
		select: {
			id: true,
			name: true,
			program: {
				select: {
					id: true,
					name: true,
				},
			},
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

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const payload = UpdateTimeEntrySchema.parse(body);

		const prisma = createClient();
		const existing = await prisma.timeEntries.findUnique({
			where: { id },
			include: {
				payPeriod: true,
			},
		});

		if (!existing) {
			return notFound('Time entry not found');
		}

		if (existing.payPeriod.status !== 'OPEN') {
			return badRequest('Cannot update time entry. Pay period is not open');
		}

		if (payload.classId) {
			const classItem = await prisma.classes.findUnique({
				where: { id: payload.classId },
			});

			if (!classItem || classItem.teacherId !== existing.teacherId) {
				return badRequest('Class must belong to the same teacher');
			}
		}

		if (payload.date) {
			const entryDate = normalizeDate(payload.date);
			const startDate = normalizeDate(existing.payPeriod.startDate);
			const endDate = normalizeDate(existing.payPeriod.endDate);

			if (entryDate < startDate || entryDate > endDate) {
				return badRequest('Date must be within pay period range');
			}
		}

		const updated = await prisma.timeEntries.update({
			where: { id },
			data: {
				...(payload.date ? { date: normalizeDate(payload.date) } : {}),
				...(payload.classId ? { classId: payload.classId } : {}),
				...(payload.hours !== undefined ? { hours: payload.hours } : {}),
				...(payload.notes !== undefined
					? { notes: payload.notes || null }
					: {}),
			},
			include: includeOptions,
		});

		return success({
			...updated,
			hours: Number(updated.hours),
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		console.log('Update staff time entry error', error);
		return internalServerError();
	}
};

const remove = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();
	const existing = await prisma.timeEntries.findUnique({
		where: { id },
		include: {
			payPeriod: true,
		},
	});

	if (!existing) {
		return notFound('Time entry not found');
	}

	if (existing.payPeriod.status !== 'OPEN') {
		return badRequest('Cannot delete time entry. Pay period is not open');
	}

	await prisma.timeEntries.delete({ where: { id } });

	return success({
		...existing,
		hours: Number(existing.hours),
	});
};

export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
