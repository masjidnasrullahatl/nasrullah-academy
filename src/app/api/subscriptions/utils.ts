import { PrismaClient } from '@prisma/client';

import {
	getSubscriptionSummary,
	listManualCharges,
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
 * The school month a recurring charge pays for. Families charged near the
 * end of a month (e.g. Oct 30 or 31) are paying for the next month.
 */
export const getChargeMonth = (periodStart: number) => {
	const date = new Date(periodStart * 1000);
	const isMonthEnd = date.getUTCDate() >= 25;
	const index = date.getUTCFullYear() * 12 + date.getUTCMonth() + (isMonthEnd ? 1 : 0);

	return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};

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
	const { year, month } = getChargeMonth(periodStart);
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
			year,
			month,
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
				const [summary, invoicePayments, unpaidInvoices] = await Promise.all([
					getSubscriptionSummary(stripeSubscriptionId),
					listSubscriptionPayments(stripeSubscriptionId),
					// Missed charges are extra; don't hide the subscription if they fail
					listUnpaidInvoices(stripeSubscriptionId).catch(() => []),
				]);

				// Charges staff ran by hand show with the automatic ones
				const manualCharges = await listManualCharges(
					stripeSubscriptionId,
					summary.customer.id,
				).catch(() => []);
				const payments = [...invoicePayments, ...manualCharges].sort(
					(a, b) => b.paidAt - a.paidAt,
				);

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
