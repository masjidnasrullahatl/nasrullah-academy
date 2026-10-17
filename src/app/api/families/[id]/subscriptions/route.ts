import { ZodError } from 'zod/v4';

import { LinkSubscriptionSchema } from '@app/api/subscriptions/types';
import { getFamilySubscriptions } from '@app/api/subscriptions/utils';
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
import { getSubscriptionSummary, isStripeEnabled } from '@helpers/stripe';

// The family's recurring payments, read live from Stripe
const getSubscriptions = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const prisma = createClient();

		if (!isStripeEnabled()) {
			return success({ stripeEnabled: false, subscriptions: [] });
		}

		return success({
			stripeEnabled: true,
			subscriptions: await getFamilySubscriptions(prisma, id),
		});
	} catch (error) {
		console.log('Get family subscriptions error', error);
		return internalServerError();
	}
};

// Links an existing Stripe subscription to the family (nothing changes in Stripe)
const linkSubscription = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const payload = LinkSubscriptionSchema.parse(await request.json());
		const prisma = createClient();

		const family = await prisma.families.findUnique({ where: { id } });

		if (!family) return notFound('Family not found');

		if (!isStripeEnabled()) return badRequest('Stripe is not connected yet');

		try {
			await getSubscriptionSummary(payload.stripeSubscriptionId);
		} catch {
			return badRequest('That subscription was not found in Stripe');
		}

		const programId = payload.programId || null;

		const existing = await prisma.familySubscriptions.findFirst({
			where: {
				familyId: id,
				programId,
				stripeSubscriptionId: payload.stripeSubscriptionId,
			},
		});

		if (existing) return success(existing);

		const link = await prisma.familySubscriptions.create({
			data: {
				familyId: id,
				programId,
				stripeSubscriptionId: payload.stripeSubscriptionId,
			},
		});

		return success(link);
	} catch (error) {
		console.log('Link subscription error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withStaff(getSubscriptions);
export const POST = withStaff(linkSubscription);
