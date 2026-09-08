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

import { UpdatePayPeriodSchema } from '../types';

const getOne = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const payPeriod = await prisma.payPeriods.findUnique({
		where: { id },
		include: {
			_count: {
				select: { timeEntries: true, payRecords: true, submissions: true },
			},
			submissions: {
				include: { teacher: { select: { firstName: true, lastName: true } } },
				orderBy: { teacher: { lastName: 'asc' } },
			},
		},
	});

	if (!payPeriod) return notFound('Pay period not found');

	return success(payPeriod);
};

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();

		const payload = UpdatePayPeriodSchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.payPeriods.findUnique({ where: { id } });

		if (!existing) return notFound('Pay period not found');

		if (existing.status === 'PAID') {
			return badRequest('Cannot update a paid pay period');
		}

		if (payload.status === 'LOCKED') {
			return badRequest('Cannot lock pay period directly. Use generate pay');
		}

		if (existing.status === 'OPEN' && payload.status === 'PAID') {
			return badRequest('Cannot mark OPEN pay period as PAID');
		}

		if (existing.status === 'LOCKED') {
			if (payload.status !== 'PAID') {
				return badRequest('Only status change LOCKED → PAID is allowed');
			}

			const hasPeriodChanges =
				payload.name !== undefined ||
				payload.startDate !== undefined ||
				payload.endDate !== undefined;

			if (hasPeriodChanges) {
				return badRequest(
					'Cannot edit period fields when pay period is LOCKED',
				);
			}
		}

		const startDate = payload.startDate || existing.startDate;
		const endDate = payload.endDate || existing.endDate;

		if (endDate <= startDate) {
			return badRequest('End date must be after start date');
		}

		const data =
			existing.status === 'LOCKED'
				? { status: 'PAID' as const }
				: {
						name: payload.name,
						startDate: payload.startDate,
						endDate: payload.endDate,
					};

		const updated = await prisma.payPeriods.update({
			where: { id },
			data,
			include: {
				_count: {
					select: { timeEntries: true, payRecords: true, submissions: true },
				},
			},
		});

		return success(updated);
	} catch (error) {
		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		console.log('Update pay period error', error);
		return internalServerError();
	}
};

const remove = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const existing = await prisma.payPeriods.findUnique({ where: { id } });

	if (!existing) return notFound('Pay period not found');

	if (existing.status !== 'OPEN') {
		return badRequest('Cannot delete a locked or paid pay period');
	}

	await prisma.$transaction([
		prisma.timeEntries.deleteMany({ where: { payPeriodId: id } }),
		prisma.teacherSubmissions.deleteMany({ where: { payPeriodId: id } }),
		prisma.payPeriods.delete({ where: { id } }),
	]);

	return success(existing);
};

export const GET = withStaff(getOne);
export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
