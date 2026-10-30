import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { ScholarshipSchema } from '../types';
import {
	mapScholarship,
	scholarshipInclude,
	toScholarshipData,
} from '../utils';

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const payload = ScholarshipSchema.parse(await request.json());

		const prisma = createClient();

		if (!(await prisma.scholarships.findUnique({ where: { id } }))) {
			return notFound('Scholarship not found');
		}

		const scholarship = await prisma.scholarships.update({
			where: { id },
			data: toScholarshipData(payload),
			include: scholarshipInclude,
		});

		return success(mapScholarship(scholarship));
	} catch (error) {
		console.log('Update scholarship error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

const remove = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	if (!(await prisma.scholarships.findUnique({ where: { id } }))) {
		return notFound('Scholarship not found');
	}

	await prisma.scholarships.delete({ where: { id } });

	return success({ id });
};

export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
