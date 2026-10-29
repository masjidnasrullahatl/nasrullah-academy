import { PrismaClient } from '@prisma/client';

import {
	getSubscriptionSummary,
	listSubscriptionPayments,
	listUnpaidInvoices,
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
	isPayer: boolean;
	family: { id: string; name: string };
	program: { id: string; name: string } | null;
};

const toLink = (row: LinkRow): SubscriptionLink => ({
	id: row.id,
	familyId: row.familyId,
	familyName: row.family.name,
	programId: row.programId,
	programName: row.program?.name || null,
	isPayer: row.isPayer,
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

/**
 * How the month a Stripe charge is for was already paid in Monthly Payments
 * (e.g. cash after the card failed), or null. Charging it again would make
 * the family pay twice.
 */
export const findPaidMonth = async (
	prisma: PrismaClient,
	stripeSubscriptionId: string,
	periodStart: number,
) => {
	const period = new Date(periodStart * 1000);
	const links = await prisma.familySubscriptions.findMany({
		where: { stripeSubscriptionId, programId: { not: null } },
		select: { familyId: true, programId: true },
	});

	if (!links.length) return null;

	const paid = await prisma.monthlyInvoices.findFirst({
		where: {
			OR: links.map((link) => ({
				familyId: link.familyId,
				programId: link.programId as string,
			})),
			year: period.getUTCFullYear(),
			month: period.getUTCMonth() + 1,
			paymentStatus: 'PAID',
		},
		select: { payMethod: true },
	});

	return paid ? paid.payMethod : null;
};

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

	const views = await Promise.all(
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
						.map((link) => [
							link.familyId,
							{ ...link.family, isPayer: link.isPayer },
						]),
				).values(),
			];

			try {
				const [summary, payments, unpaidInvoices] = await Promise.all([
					getSubscriptionSummary(stripeSubscriptionId),
					listSubscriptionPayments(stripeSubscriptionId),
					// Missed charges are extra; don't hide the subscription if they fail
					listUnpaidInvoices(stripeSubscriptionId).catch(() => []),
				]);

				const unpaid = await Promise.all(
					unpaidInvoices.map(async (invoice) => ({
						...invoice,
						paidInPortal: await findPaidMonth(
							prisma,
							stripeSubscriptionId,
							invoice.periodStart,
						),
					})),
				);

				return {
					stripeSubscriptionId,
					links,
					otherFamilies,
					summary,
					payments,
					unpaid,
					error: null,
				};
			} catch (error) {
				return {
					stripeSubscriptionId,
					links,
					otherFamilies,
					summary: null,
					payments: [],
					unpaid: [],
					error:
						error instanceof Error
							? error.message
							: 'Unable to load this subscription from Stripe',
				};
			}
		}),
	);

	// Current payments first, then past (cancelled) ones, newest first
	const isPast = (view: FamilySubscriptionView) =>
		['canceled', 'incomplete_expired'].includes(view.summary?.status || '');

	return views.sort(
		(a, b) =>
			Number(isPast(a)) - Number(isPast(b)) ||
			(b.summary?.startedAt || 0) - (a.summary?.startedAt || 0),
	);
};
