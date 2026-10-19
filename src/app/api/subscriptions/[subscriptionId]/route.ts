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
import { updateSubscriptionAmount } from '@helpers/stripe';

import { UpdateSubscriptionAmountSchema } from '../types';
import { isLinkedSubscription } from '../utils';

// Changes the monthly amount from the next charge on
const updateAmount = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ subscriptionId: string }>,
) => {
	try {
		const { subscriptionId } = await params;
		const payload = UpdateSubscriptionAmountSchema.parse(await request.json());

		if (!(await isLinkedSubscription(createClient(), subscriptionId))) {
			return notFound('This subscription is not linked to an Academy family');
		}

		try {
			await updateSubscriptionAmount(subscriptionId, payload.amount);
		} catch (error) {
			return badRequest(
				error instanceof Error ? error.message : 'Stripe could not update it',
			);
		}

		return success({ subscriptionId, amount: payload.amount });
	} catch (error) {
		console.log('Update subscription amount error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const PATCH = withStaff(updateAmount);
