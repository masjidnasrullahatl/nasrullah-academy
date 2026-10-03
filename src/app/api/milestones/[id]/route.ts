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

import { UpdateMilestoneSchema } from '../types';
import {
	isDuplicateJuzError,
	mapMilestone,
	milestoneInclude,
	toMilestoneData,
} from '../utils';

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const payload = UpdateMilestoneSchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.milestones.findUnique({ where: { id } });

		if (!existing) return notFound('Milestone not found');

		const milestone = await prisma.milestones.update({
			where: { id },
			data: toMilestoneData(payload),
			include: milestoneInclude,
		});

		return success(mapMilestone(milestone));
	} catch (error) {
		console.log('Update milestone error', error);

		if (error instanceof ZodError) return catchZodError(error);

		if (isDuplicateJuzError(error)) {
			return badRequest('This Juz is already recorded for this student');
		}

		return internalServerError();
	}
};

const remove = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const milestone = await prisma.milestones.findUnique({ where: { id } });

	if (!milestone) return notFound('Milestone not found');

	await prisma.milestones.delete({ where: { id } });

	return success(milestone);
};

export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
