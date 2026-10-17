import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

// Removes the link from this family only; the Stripe subscription is untouched
const unlink = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string; linkId: string }>,
) => {
	const { id, linkId } = await params;
	const prisma = createClient();

	const link = await prisma.familySubscriptions.findFirst({
		where: { id: linkId, familyId: id },
	});

	if (!link) return notFound('Link not found');

	await prisma.familySubscriptions.delete({ where: { id: linkId } });

	return success(link);
};

export const DELETE = withStaff(unlink);
