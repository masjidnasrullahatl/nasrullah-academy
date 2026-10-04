import { NextRequest, NextResponse } from 'next/server';

import { markMonthPaidByCard } from '@app/api/registrations/utils';

import { createClient } from '@helpers/prisma/server';
import { verifyStripeWebhook } from '@helpers/stripe';

type StripeEvent = {
	type: string;
	data: { object: Record<string, any> };
};

/**
 * Stripe calls this after card payments.
 * - checkout.session.completed: the registration's first payment went through.
 * - invoice.paid (monthly renewals): marks that month's payment row as paid.
 */
export async function POST(request: NextRequest) {
	const payload = await request.text();

	if (!verifyStripeWebhook(payload, request.headers.get('stripe-signature'))) {
		return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
	}

	const event = JSON.parse(payload) as StripeEvent;
	const object = event.data.object;
	const prisma = createClient();

	try {
		if (event.type === 'checkout.session.completed') {
			const registrationId =
				object.metadata?.registrationId || object.client_reference_id;

			if (!registrationId) return NextResponse.json({ received: true });

			const registration = await prisma.registrations.update({
				where: { id: registrationId },
				data: {
					paymentStatus: 'PAID',
					paidAt: new Date(),
					stripeCustomerId: object.customer || null,
					stripeSubscriptionId: object.subscription || null,
				},
			});

			// Already approved: mark this month's row paid too
			if (registration.familyId) {
				const now = new Date();

				await markMonthPaidByCard(
					prisma,
					registration.familyId,
					registration.programId,
					now.getFullYear(),
					now.getMonth() + 1,
				);
			}
		}

		if (
			event.type === 'invoice.paid' &&
			object.billing_reason === 'subscription_cycle' &&
			object.subscription
		) {
			const registration = await prisma.registrations.findFirst({
				where: { stripeSubscriptionId: String(object.subscription) },
			});

			if (registration?.familyId) {
				const paidAt = new Date((object.created || Date.now() / 1000) * 1000);

				await markMonthPaidByCard(
					prisma,
					registration.familyId,
					registration.programId,
					paidAt.getFullYear(),
					paidAt.getMonth() + 1,
				);
			}
		}
	} catch (error) {
		console.log('Stripe webhook error', error);

		return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}
