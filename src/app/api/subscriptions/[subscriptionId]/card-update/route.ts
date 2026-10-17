import { NextResponse } from 'next/server';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { badRequest, notFound, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';

import { createClient } from '@helpers/prisma/server';
import {
	createCardUpdateSession,
	getSubscriptionSummary,
} from '@helpers/stripe';

import { isLinkedSubscription } from '../../utils';

/**
 * Makes a secure Stripe page for entering a new card. Staff open it or send
 * the link to the parent; the link works for 24 hours.
 */
const createCardUpdateLink = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ subscriptionId: string }>,
): Promise<NextResponse> => {
	const { subscriptionId } = await params;

	if (!(await isLinkedSubscription(createClient(), subscriptionId))) {
		return notFound('This subscription is not linked to an Academy family');
	}

	try {
		const summary = await getSubscriptionSummary(subscriptionId);
		const origin = NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
		const page = `${origin}/register/card-updated`;

		const session = await createCardUpdateSession({
			subscriptionId,
			customerId: summary.customer.id,
			successUrl: `${page}?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${page}?cancelled=1`,
		});

		return success({ url: session.url, expiresAt: session.expires_at });
	} catch (error) {
		return badRequest(
			error instanceof Error ? error.message : 'Unable to create the card page',
		);
	}
};

export const POST = withStaff(createCardUpdateLink);
