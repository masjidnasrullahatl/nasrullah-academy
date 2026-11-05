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

import {
	postScholarship,
	ScholarshipPostError,
	undoScholarshipPost,
} from '../posting';
import { ScholarshipSchema } from '../types';
import {
	mapScholarship,
	scholarshipInclude,
	toScholarshipData,
} from '../utils';

// The old amount comes off its payment record, then the new one goes on
const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const payload = ScholarshipSchema.parse(await request.json());

		const prisma = createClient();

		const existing = await prisma.scholarships.findUnique({ where: { id } });

		if (!existing) return notFound('Scholarship not found');

		const scholarship = await prisma.$transaction(async (tx) => {
			await undoScholarshipPost(tx, existing);
			await tx.scholarships.update({
				where: { id },
				data: toScholarshipData(payload),
			});
			await postScholarship(tx, {
				...payload,
				id,
				donorName: payload.donorName || null,
			});

			return tx.scholarships.findUniqueOrThrow({
				where: { id },
				include: scholarshipInclude,
			});
		});

		return success(mapScholarship(scholarship));
	} catch (error) {
		console.log('Update scholarship error', error);

		if (error instanceof ZodError) return catchZodError(error);

		if (error instanceof ScholarshipPostError) {
			return badRequest(error.message);
		}

		return internalServerError();
	}
};

// The money comes off its payment record with the scholarship
const remove = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const existing = await prisma.scholarships.findUnique({ where: { id } });

	if (!existing) return notFound('Scholarship not found');

	await prisma.$transaction(async (tx) => {
		await undoScholarshipPost(tx, existing);
		await tx.scholarships.delete({ where: { id } });
	});

	return success({ id });
};

export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
