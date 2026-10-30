import { NextRequest, NextResponse } from 'next/server';

import { markMonthPaidByCard } from '@app/api/registrations/utils';
import { isLinkedSubscription } from '@app/api/subscriptions/utils';

import { createClient } from '@helpers/prisma/server';
import { applyCardUpdate, verifyStripeWebhook } from '@helpers/stripe';

type StripeEvent = {
	type: string;
	data: { object: Record<string, any> };
};

/**
 * Stripe calls this after card payments.
 * - checkout.session.completed: the registration's first payment went through.
 * - invoice.paid (monthly renewals): marks that month's payment row as paid,
 *   for registrations and for families linked to the subscription.
 * - checkout.session.completed for a card update: puts the new card on the
 *   subscription (the return page does this too; doing it twice is harmless).
 *
 * The masjid's Stripe account also sends events for donations and other
 * payments (masjid CRM). Anything that isn't an Academy registration or an
 * Academy recurring payment is acknowledged and left alone, so Stripe doesn't
 * count it as a failure and keep retrying.
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
		if (
			event.type === 'checkout.session.completed' &&
			object.metadata?.purpose === 'card_update'
		) {
			const cardSubscriptionId = object.metadata?.subscriptionId;

			if (
				cardSubscriptionId &&
				(await isLinkedSubscription(prisma, String(cardSubscriptionId)))
			) {
				await applyCardUpdate(String(object.id));
			}

			return NextResponse.json({ received: true });
		}

		if (event.type === 'checkout.session.completed') {
			const registrationId =
				object.metadata?.registrationId || object.client_reference_id;

			if (!registrationId) return NextResponse.json({ received: true });

			// Donations and other masjid payments aren't Academy registrations
			const existing = await prisma.registrations.findUnique({
				where: { id: String(registrationId) },
				select: { id: true },
			});

			if (!existing) return NextResponse.json({ received: true });

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

		// newer API versions moved the subscription under parent
		const subscriptionId =
			object.subscription ||
			object.parent?.subscription_details?.subscription ||
			null;

		if (
			event.type === 'invoice.paid' &&
			object.billing_reason === 'subscription_cycle' &&
			subscriptionId
		) {
			const registration = await prisma.registrations.findFirst({
				where: { stripeSubscriptionId: String(subscriptionId) },
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

			// Families linked to the subscription (recurring payments moved
			// over from Keela). The month is the one the charge pays for.
			const links = await prisma.familySubscriptions.findMany({
				where: { stripeSubscriptionId: String(subscriptionId) },
			});

			const periodStart =
				object.lines?.data?.[0]?.period?.start ||
				object.created ||
				Date.now() / 1000;
			const period = new Date(periodStart * 1000);

			for (const link of links) {
				if (!link.programId) continue;

				await markMonthPaidByCard(
					prisma,
					link.familyId,
					link.programId,
					period.getUTCFullYear(),
					period.getUTCMonth() + 1,
				);
			}
		}
	} catch (error) {
		console.log('Stripe webhook error', error);

		return NextResponse.json({ error: 'Webhook handling failed' }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}
