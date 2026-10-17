import { PrismaClient } from '@prisma/client';

import {
	getSubscriptionSummary,
	listSubscriptionPayments,
} from '@helpers/stripe';

import { FamilySubscriptionView, SubscriptionLink } from './types';

const linkInclude = {
	family: { select: { id: true, name: true } },
	program: { select: { id: true, name: true } },
} as const;

type LinkRow = {
	id: string;
	familyId: string;
	programId: string | null;
	stripeSubscriptionId: string;
	family: { id: string; name: string };
	program: { id: string; name: string } | null;
};

const toLink = (row: LinkRow): SubscriptionLink => ({
	id: row.id,
	familyId: row.familyId,
	familyName: row.family.name,
	programId: row.programId,
	programName: row.program?.name || null,
});

/**
 * Only subscriptions linked to an Academy family can be managed here, so
 * general donation subscriptions in the same Stripe account are never touched.
 */
export const isLinkedSubscription = async (
	prisma: PrismaClient,
	stripeSubscriptionId: string,
) =>
	Boolean(
		await prisma.familySubscriptions.findFirst({
			where: { stripeSubscriptionId },
			select: { id: true },
		}),
	);

/** The family's linked subscriptions with live details from Stripe. */
export const getFamilySubscriptions = async (
	prisma: PrismaClient,
	familyId: string,
): Promise<FamilySubscriptionView[]> => {
	const familyLinks = await prisma.familySubscriptions.findMany({
		where: { familyId },
		include: linkInclude,
		orderBy: { createdAt: 'asc' },
	});

	const subscriptionIds = [
		...new Set(familyLinks.map((link) => link.stripeSubscriptionId)),
	];

	const allLinks = await prisma.familySubscriptions.findMany({
		where: { stripeSubscriptionId: { in: subscriptionIds } },
		include: linkInclude,
	});

	return Promise.all(
		subscriptionIds.map(async (stripeSubscriptionId) => {
			const links = familyLinks
				.filter((link) => link.stripeSubscriptionId === stripeSubscriptionId)
				.map(toLink);

			const otherFamilies = [
				...new Map(
					allLinks
						.filter(
							(link) =>
								link.stripeSubscriptionId === stripeSubscriptionId &&
								link.familyId !== familyId,
						)
						.map((link) => [link.familyId, link.family]),
				).values(),
			];

			try {
				const [summary, payments] = await Promise.all([
					getSubscriptionSummary(stripeSubscriptionId),
					listSubscriptionPayments(stripeSubscriptionId),
				]);

				return {
					stripeSubscriptionId,
					links,
					otherFamilies,
					summary,
					payments,
					error: null,
				};
			} catch (error) {
				return {
					stripeSubscriptionId,
					links,
					otherFamilies,
					summary: null,
					payments: [],
					error:
						error instanceof Error
							? error.message
							: 'Unable to load this subscription from Stripe',
				};
			}
		}),
	);
};
