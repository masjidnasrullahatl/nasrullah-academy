import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { mapRegistration, registrationInclude } from '../types';
import { findMatchingFamily } from '../utils';

// One registration plus the existing family it most likely belongs to
const getDetail = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const registration = await prisma.registrations.findUnique({
		where: { id },
		include: registrationInclude,
	});

	if (!registration) return notFound('Registration not found');

	const matchedFamily =
		registration.status === 'PENDING'
			? await findMatchingFamily(prisma, registration)
			: null;

	return success({ ...mapRegistration(registration), matchedFamily });
};

export const GET = withStaff(getDetail);
