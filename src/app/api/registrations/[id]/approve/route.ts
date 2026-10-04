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

import { ApproveRegistrationSchema } from '../../types';
import { approveRegistration } from '../../utils';

const approve = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const payload = ApproveRegistrationSchema.parse(body);

		const prisma = createClient();

		const registration = await prisma.registrations.findUnique({
			where: { id },
		});

		if (!registration) return notFound('Registration not found');

		if (registration.status !== 'PENDING') {
			return badRequest('This registration has already been reviewed');
		}

		const result = await prisma.$transaction((tx) =>
			approveRegistration(tx, id, payload.familyId || null),
		);

		return success(result);
	} catch (error) {
		console.log('Approve registration error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const POST = withStaff(approve);
