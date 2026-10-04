import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { badRequest, notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

const reject = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const registration = await prisma.registrations.findUnique({ where: { id } });

	if (!registration) return notFound('Registration not found');

	if (registration.status !== 'PENDING') {
		return badRequest('This registration has already been reviewed');
	}

	const updated = await prisma.registrations.update({
		where: { id },
		data: { status: 'REJECTED', reviewedAt: new Date() },
	});

	return success(updated);
};

export const POST = withStaff(reject);
