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
import { setSubscriptionCancellation } from '@helpers/stripe';

import { CancelSubscriptionSchema } from '../../types';
import { isLinkedSubscription } from '../../utils';

// Cancels (now or after the paid month) or resumes a recurring payment
const cancel = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ subscriptionId: string }>,
) => {
	try {
		const { subscriptionId } = await params;
		const payload = CancelSubscriptionSchema.parse(await request.json());

		if (!(await isLinkedSubscription(createClient(), subscriptionId))) {
			return notFound('This subscription is not linked to an Academy family');
		}

		try {
			await setSubscriptionCancellation(subscriptionId, payload.when);
		} catch (error) {
			return badRequest(
				error instanceof Error ? error.message : 'Stripe could not update it',
			);
		}

		return success({ subscriptionId, when: payload.when });
	} catch (error) {
		console.log('Cancel subscription error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const POST = withStaff(cancel);
