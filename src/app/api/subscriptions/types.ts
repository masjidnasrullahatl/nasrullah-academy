import z from 'zod/v4';

import type { SubscriptionPayment, SubscriptionSummary } from '@helpers/stripe';

export const LinkSubscriptionSchema = z.object({
	stripeSubscriptionId: z
		.string()
		.trim()
		.regex(/^sub_\w+$/, 'Enter a Stripe subscription ID (starts with sub_)'),
	programId: z.string().optional().nullable(),
});

export const UpdateSubscriptionAmountSchema = z.object({
	amount: z.number().positive('Enter the monthly amount').max(10000),
});

export const CancelSubscriptionSchema = z.object({
	when: z.enum(['period_end', 'now', 'resume']),
});

export type SubscriptionLink = {
	id: string;
	familyId: string;
	familyName: string;
	programId: string | null;
	programName: string | null;
	isPayer: boolean;
};

export type FamilySubscriptionView = {
	stripeSubscriptionId: string;
	// links of this family to the subscription (one per program)
	links: SubscriptionLink[];
	// other families on the same subscription (isPayer: they pay it)
	otherFamilies: { id: string; name: string; isPayer: boolean }[];
	summary: SubscriptionSummary | null;
	payments: SubscriptionPayment[];
	error: string | null;
};

export type FamilySubscriptionsResponse = {
	stripeEnabled: boolean;
	subscriptions: FamilySubscriptionView[];
};
