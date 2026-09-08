import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { getCurrentTeacher } from '../../../utils';
import { UpdateTimeEntrySchema } from '../types';

const normalizeDate = (value: Date) => {
	const normalized = new Date(value);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};

const updateMyTimeEntry = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const teacher = await getCurrentTeacher(request.user.id);

		if (!teacher) return notFound('Teacher profile not found');

		const { id } = await params;
		const body = await request.json();

		const payload = UpdateTimeEntrySchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.timeEntries.findFirst({
			where: { id, teacherId: teacher.id },
			include: { payPeriod: true },
		});

		if (!existing) return notFound('Time entry not found');

		if (existing.payPeriod.status !== 'OPEN') {
			return badRequest('Cannot edit time entry. Pay period is not open');
		}

		const submission = await prisma.teacherSubmissions.findUnique({
			where: {
				teacherId_payPeriodId: {
					teacherId: teacher.id,
					payPeriodId: existing.payPeriodId,
				},
			},
		});

		if (submission) {
			return badRequest('Hours already submitted for this pay period');
		}

		if (payload.classId) {
			const classItem = await prisma.classes.findFirst({
				where: {
					id: payload.classId,
					teacherId: teacher.id,
					status: 'ACTIVE',
				},
			});

			if (!classItem) {
				return badRequest(
					'Invalid class. You can only log hours for your classes',
				);
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
				date: payload.date ? normalizeDate(payload.date) : existing.date,
				hours: payload.hours ?? existing.hours,
				notes:
					typeof payload.notes === 'string' ? payload.notes : existing.notes,
				classId: payload.classId || existing.classId,
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

		return success({ ...updated, hours: Number(updated.hours) });
	} catch (error) {
		console.log('Update my time entry error', error);
		return internalServerError();
	}
};

const deleteMyTimeEntry = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) return notFound('Teacher profile not found');

	const { id } = await params;

	const prisma = createClient();

	const existing = await prisma.timeEntries.findFirst({
		where: { id, teacherId: teacher.id },
		include: { payPeriod: true },
	});

	if (!existing) return notFound('Time entry not found');

	if (existing.payPeriod.status !== 'OPEN') {
		return badRequest('Cannot delete time entry. Pay period is not open');
	}

	const submission = await prisma.teacherSubmissions.findUnique({
		where: {
			teacherId_payPeriodId: {
				teacherId: teacher.id,
				payPeriodId: existing.payPeriodId,
			},
		},
	});

	if (submission) {
		return badRequest('Hours already submitted for this pay period');
	}

	await prisma.timeEntries.delete({ where: { id } });

	return success({ ...existing, hours: Number(existing.hours) });
};

export const PATCH = withAuth(updateMyTimeEntry);
export const DELETE = withAuth(deleteMyTimeEntry);
