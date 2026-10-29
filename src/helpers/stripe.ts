import crypto from 'crypto';

// Stripe is called through its REST API, so no SDK is needed. Card payment
// switches on as soon as STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set
// in the hosting environment.
const STRIPE_API = 'https://api.stripe.com/v1';
// Pinned so response shapes don't change with the account's default version
const STRIPE_VERSION = '2024-06-20';

const getSecretKey = () => process.env.STRIPE_SECRET_KEY || '';

export const isStripeEnabled = () => Boolean(getSecretKey());

// Paying by card on the public registration forms is switched on separately
// (STRIPE_REGISTRATION_CARD=on), so connecting Stripe for recurring payments
// doesn't turn it on by itself.
export const isRegistrationCardEnabled = () =>
	isStripeEnabled() && process.env.STRIPE_REGISTRATION_CARD === 'on';

type StripeParams = Record<string, string | string[]>;

const toSearchParams = (params: StripeParams = {}) => {
	const search = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		for (const item of Array.isArray(value) ? value : [value]) {
			search.append(key, item);
		}
	}

	return search;
};

const stripeRequest = async <T>(
	method: 'GET' | 'POST' | 'DELETE',
	path: string,
	params?: StripeParams,
	// same key twice = Stripe returns the first result instead of acting again
	idempotencyKey?: string,
) => {
	const search = toSearchParams(params);
	const isGet = method === 'GET';

	const response = await fetch(
		`${STRIPE_API}${path}${isGet && params ? `?${search}` : ''}`,
		{
			method,
			headers: {
				Authorization: `Bearer ${getSecretKey()}`,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Stripe-Version': STRIPE_VERSION,
				...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
			},
			body: isGet ? undefined : search,
			cache: 'no-store',
		},
	);

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data?.error?.message || 'Stripe request failed');
	}

	return data as T;
};

const stripePost = <T>(path: string, params: StripeParams) =>
	stripeRequest<T>('POST', path, params);

const stripeGet = <T>(path: string, params?: StripeParams) =>
	stripeRequest<T>('GET', path, params);

const toCents = (amount: number) => Math.round(amount * 100);

type CheckoutParams = {
	registrationId: string;
	email: string;
	description: string;
	// charged every month, card fee included
	monthlyAmount: number;
	// charged once with the first payment (registration fee + its card fee)
	oneTimeAmount: number;
	successUrl: string;
	cancelUrl: string;
};

/**
 * Creates a Stripe-hosted checkout page. With a monthly amount it starts a
 * subscription (first month + one-time registration fee today, then monthly);
 * otherwise it is a single payment.
 */
export const createCheckoutSession = async (params: CheckoutParams) => {
	const isSubscription = params.monthlyAmount > 0;

	const body: Record<string, string> = {
		mode: isSubscription ? 'subscription' : 'payment',
		customer_email: params.email,
		client_reference_id: params.registrationId,
		'metadata[registrationId]': params.registrationId,
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
	};

	let index = 0;

	if (isSubscription) {
		body['subscription_data[metadata][registrationId]'] = params.registrationId;
		body[`line_items[${index}][price_data][currency]`] = 'usd';
		body[`line_items[${index}][price_data][product_data][name]`] =
			`${params.description} - monthly tuition`;
		body[`line_items[${index}][price_data][unit_amount]`] = String(
			toCents(params.monthlyAmount),
		);
		body[`line_items[${index}][price_data][recurring][interval]`] = 'month';
		body[`line_items[${index}][quantity]`] = '1';
		index += 1;
	}

	if (params.oneTimeAmount > 0) {
		body[`line_items[${index}][price_data][currency]`] = 'usd';
		body[`line_items[${index}][price_data][product_data][name]`] =
			`${params.description} - registration fee`;
		body[`line_items[${index}][price_data][unit_amount]`] = String(
			toCents(params.oneTimeAmount),
		);
		body[`line_items[${index}][quantity]`] = '1';
	}

	return stripePost<{ id: string; url: string }>('/checkout/sessions', body);
};

/* ---------------------------------------------------------------------------
 * Recurring payments (subscriptions)
 * ------------------------------------------------------------------------- */

type StripeCard = {
	brand: string;
	last4: string;
	exp_month: number;
	exp_year: number;
};

type StripePaymentMethod = { id: string; card?: StripeCard } | null;

type StripeSubscription = {
	id: string;
	status: string;
	start_date: number;
	current_period_end: number;
	cancel_at_period_end: boolean;
	cancel_at: number | null;
	canceled_at: number | null;
	trial_end: number | null;
	default_payment_method: StripePaymentMethod | string;
	customer: {
		id: string;
		name: string | null;
		email: string | null;
		phone: string | null;
		invoice_settings?: {
			default_payment_method: StripePaymentMethod | string;
		};
	};
	items: {
		data: {
			id: string;
			quantity: number;
			price: {
				unit_amount: number;
				product: string;
				recurring: { interval: string; interval_count: number };
			};
		}[];
	};
};

export type SubscriptionCard = {
	brand: string;
	last4: string;
	expMonth: number;
	expYear: number;
};

export type SubscriptionSummary = {
	id: string;
	status: string;
	amount: number;
	interval: string;
	intervalCount: number;
	startedAt: number;
	nextPaymentAt: number | null;
	trialEnd: number | null;
	cancelAtPeriodEnd: boolean;
	cancelAt: number | null;
	canceledAt: number | null;
	card: SubscriptionCard | null;
	customer: {
		id: string;
		name: string | null;
		email: string | null;
		phone: string | null;
	};
};

const toCard = (
	paymentMethod: StripePaymentMethod | string | undefined,
): SubscriptionCard | null =>
	paymentMethod && typeof paymentMethod === 'object' && paymentMethod.card
		? {
				brand: paymentMethod.card.brand,
				last4: paymentMethod.card.last4,
				expMonth: paymentMethod.card.exp_month,
				expYear: paymentMethod.card.exp_year,
			}
		: null;

const getRawSubscription = (subscriptionId: string) =>
	stripeGet<StripeSubscription>(`/subscriptions/${subscriptionId}`, {
		'expand[]': [
			'default_payment_method',
			'customer',
			'customer.invoice_settings.default_payment_method',
		],
	});

/** The subscription's amount, status, card and dates, as shown to staff. */
export const getSubscriptionSummary = async (
	subscriptionId: string,
): Promise<SubscriptionSummary> => {
	const subscription = await getRawSubscription(subscriptionId);
	const item = subscription.items.data[0];
	const isLive = ['active', 'trialing', 'past_due'].includes(
		subscription.status,
	);

	return {
		id: subscription.id,
		status: subscription.status,
		amount: item ? (item.price.unit_amount * (item.quantity || 1)) / 100 : 0,
		interval: item?.price.recurring?.interval || 'month',
		intervalCount: item?.price.recurring?.interval_count || 1,
		startedAt: subscription.start_date,
		nextPaymentAt:
			isLive && !subscription.cancel_at_period_end
				? subscription.current_period_end
				: null,
		trialEnd:
			subscription.status === 'trialing' ? subscription.trial_end : null,
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		cancelAt: subscription.cancel_at,
		canceledAt: subscription.canceled_at,
		// Keela charges a specific card; fall back to the customer's default
		card:
			toCard(subscription.default_payment_method) ||
			toCard(subscription.customer.invoice_settings?.default_payment_method),
		customer: {
			id: subscription.customer.id,
			name: subscription.customer.name,
			email: subscription.customer.email,
			phone: subscription.customer.phone,
		},
	};
};

export type SubscriptionPayment = {
	id: string;
	number: string | null;
	amount: number;
	paidAt: number;
	receiptUrl: string | null;
	pdfUrl: string | null;
};

type StripeInvoice = {
	id: string;
	number: string | null;
	amount_paid: number;
	created: number;
	status_transitions: { paid_at: number | null };
	hosted_invoice_url: string | null;
	invoice_pdf: string | null;
};

/** Paid charges of a subscription, newest first (free trial invoices left out). */
export const listSubscriptionPayments = async (subscriptionId: string) => {
	const invoices = await stripeGet<{ data: StripeInvoice[] }>('/invoices', {
		subscription: subscriptionId,
		status: 'paid',
		limit: '100',
	});

	return invoices.data
		.filter((invoice) => invoice.amount_paid > 0)
		.map(
			(invoice): SubscriptionPayment => ({
				id: invoice.id,
				number: invoice.number,
				amount: invoice.amount_paid / 100,
				paidAt: invoice.status_transitions.paid_at || invoice.created,
				receiptUrl: invoice.hosted_invoice_url,
				pdfUrl: invoice.invoice_pdf,
			}),
		);
};

export type UnpaidInvoice = {
	id: string;
	number: string | null;
	amount: number;
	// start of the month the charge is for
	periodStart: number;
	attemptCount: number;
	nextAttemptAt: number | null;
	failureMessage: string | null;
	status: string;
};

type StripeOpenInvoice = {
	id: string;
	number: string | null;
	status: string;
	subscription: string | null;
	amount_remaining: number;
	created: number;
	attempt_count: number;
	next_payment_attempt: number | null;
	lines: { data: { period: { start: number } }[] };
	payment_intent: {
		last_payment_error: { message?: string; decline_code?: string } | null;
	} | null;
};

const UNPAID_STATUSES = ['open', 'uncollectible'];

/** Charges Stripe billed but couldn't collect (e.g. card declined), oldest first. */
export const listUnpaidInvoices = async (subscriptionId: string) => {
	const lists = await Promise.all(
		UNPAID_STATUSES.map((status) =>
			stripeGet<{ data: StripeOpenInvoice[] }>('/invoices', {
				subscription: subscriptionId,
				status,
				limit: '24',
				'expand[]': ['data.payment_intent'],
			}),
		),
	);

	return lists
		.flatMap((list) => list.data)
		.filter((invoice) => invoice.amount_remaining > 0)
		.sort((a, b) => a.created - b.created)
		.map(
			(invoice): UnpaidInvoice => ({
				id: invoice.id,
				number: invoice.number,
				amount: invoice.amount_remaining / 100,
				periodStart: invoice.lines.data[0]?.period.start || invoice.created,
				attemptCount: invoice.attempt_count,
				nextAttemptAt: invoice.next_payment_attempt,
				failureMessage:
					invoice.payment_intent?.last_payment_error?.message || null,
				status: invoice.status,
			}),
		);
};

/**
 * Charges the card on file for a charge Stripe already billed. Paying the
 * existing invoice (never a new charge) means it can't be paid twice: Stripe
 * refuses an invoice that is already paid.
 */
export const payUnpaidInvoice = async (
	subscriptionId: string,
	invoiceId: string,
	// refuses when the month was already paid another way
	// eslint-disable-next-line no-unused-vars
	isMonthPaid: (periodStart: number) => Promise<boolean>,
) => {
	const invoice = await stripeGet<StripeOpenInvoice>(`/invoices/${invoiceId}`);

	if (invoice.subscription !== subscriptionId) {
		throw new Error('This charge does not belong to this recurring payment');
	}

	if (!UNPAID_STATUSES.includes(invoice.status)) {
		throw new Error('This charge is already paid or was cancelled');
	}

	if (
		await isMonthPaid(invoice.lines.data[0]?.period.start || invoice.created)
	) {
		throw new Error(
			'This month is already marked paid in Monthly Payments, so the card was not charged',
		);
	}

	return stripePost<{ status: string; amount_paid: number }>(
		`/invoices/${invoiceId}/pay`,
		{},
	);
};

type StripePaymentIntent = {
	id: string;
	status: string;
	amount_received: number;
	created: number;
	description: string | null;
	metadata: Record<string, string>;
	last_payment_error: { message?: string } | null;
	latest_charge: { receipt_url: string | null } | string | null;
};

const paymentMethodId = (paymentMethod: StripePaymentMethod | string) =>
	typeof paymentMethod === 'string' ? paymentMethod : paymentMethod?.id;

/**
 * Charges the card on file of a recurring payment once (a missed month,
 * a month after the recurring payment stopped, etc.). Works on cancelled
 * recurring payments too, as the card stays saved on the customer.
 */
export const chargeCardOnFile = async ({
	subscriptionId,
	amount,
	description,
	metadata,
	idempotencyKey,
}: {
	subscriptionId: string;
	amount: number;
	description: string;
	metadata: Record<string, string>;
	idempotencyKey: string;
}) => {
	const subscription = await getRawSubscription(subscriptionId);
	const paymentMethod =
		paymentMethodId(subscription.default_payment_method) ||
		paymentMethodId(
			subscription.customer.invoice_settings?.default_payment_method || null,
		);

	if (!paymentMethod) throw new Error('There is no card on file to charge');

	const params: StripeParams = {
		amount: String(toCents(amount)),
		currency: 'usd',
		customer: subscription.customer.id,
		payment_method: paymentMethod,
		off_session: 'true',
		confirm: 'true',
		description,
		'metadata[purpose]': 'manual_charge',
		'metadata[subscriptionId]': subscriptionId,
	};

	for (const [key, value] of Object.entries(metadata)) {
		params[`metadata[${key}]`] = value;
	}

	if (subscription.customer.email) {
		params.receipt_email = subscription.customer.email;
	}

	// A decline comes back as an error with the bank's reason. The card is
	// part of the key so a retry after a card update isn't blocked.
	const intent = await stripeRequest<StripePaymentIntent>(
		'POST',
		'/payment_intents',
		params,
		`${idempotencyKey}-${paymentMethod}`,
	);

	if (intent.status !== 'succeeded') {
		throw new Error(
			intent.last_payment_error?.message || 'The card was not charged',
		);
	}

	return intent;
};

/** Charges made with chargeCardOnFile for a recurring payment, newest first. */
export const listManualCharges = async (
	subscriptionId: string,
	customerId: string,
) => {
	const intents = await stripeGet<{ data: StripePaymentIntent[] }>(
		'/payment_intents',
		{ customer: customerId, limit: '100', 'expand[]': ['data.latest_charge'] },
	);

	return intents.data
		.filter(
			(intent) =>
				intent.status === 'succeeded' &&
				intent.metadata?.purpose === 'manual_charge' &&
				intent.metadata?.subscriptionId === subscriptionId,
		)
		.map(
			(intent): SubscriptionPayment => ({
				id: intent.id,
				number: intent.metadata.month
					? `Manual charge (${intent.metadata.month})`
					: 'Manual charge',
				amount: intent.amount_received / 100,
				paidAt: intent.created,
				receiptUrl:
					intent.latest_charge && typeof intent.latest_charge === 'object'
						? intent.latest_charge.receipt_url
						: null,
				pdfUrl: null,
			}),
		);
};

/**
 * Changes the monthly amount from the next charge on. Nothing is charged or
 * refunded now (no proration).
 */
export const updateSubscriptionAmount = async (
	subscriptionId: string,
	amount: number,
) => {
	const subscription = await getRawSubscription(subscriptionId);
	const item = subscription.items.data[0];

	if (!item) throw new Error('This subscription has no price to change');

	await stripePost(`/subscriptions/${subscriptionId}`, {
		'items[0][id]': item.id,
		'items[0][quantity]': '1',
		'items[0][price_data][currency]': 'usd',
		'items[0][price_data][product]': item.price.product,
		'items[0][price_data][unit_amount]': String(toCents(amount)),
		'items[0][price_data][recurring][interval]':
			item.price.recurring?.interval || 'month',
		'items[0][price_data][recurring][interval_count]': String(
			item.price.recurring?.interval_count || 1,
		),
		proration_behavior: 'none',
	});
};

/**
 * 'period_end': stops after the month already paid for (like Keela's
 * Pre-Cancelled); 'now': stops immediately; 'resume': undoes a pending stop.
 */
export const setSubscriptionCancellation = async (
	subscriptionId: string,
	when: 'period_end' | 'now' | 'resume',
) => {
	if (when === 'now') {
		await stripeRequest('DELETE', `/subscriptions/${subscriptionId}`);
		return;
	}

	await stripePost(`/subscriptions/${subscriptionId}`, {
		cancel_at_period_end: when === 'period_end' ? 'true' : 'false',
	});
};

/**
 * A Stripe-hosted page where the parent enters a new card. The card details
 * never pass through this app; the new card is put on the subscription once
 * the page is completed (see applyCardUpdate). The customer isn't passed to
 * the page so their email isn't prefilled, which would make Stripe Link text
 * the parent a sign-in code.
 */
export const createCardUpdateSession = async ({
	subscriptionId,
	customerId,
	successUrl,
	cancelUrl,
}: {
	subscriptionId: string;
	customerId: string;
	successUrl: string;
	cancelUrl: string;
}) =>
	stripePost<{ id: string; url: string; expires_at: number }>(
		'/checkout/sessions',
		{
			mode: 'setup',
			currency: 'usd',
			'payment_method_types[0]': 'card',
			'metadata[purpose]': 'card_update',
			'metadata[subscriptionId]': subscriptionId,
			'metadata[customerId]': customerId,
			'setup_intent_data[metadata][subscriptionId]': subscriptionId,
			success_url: successUrl,
			cancel_url: cancelUrl,
		},
	);

type StripeSetupSession = {
	id: string;
	mode: string;
	status: string;
	metadata: Record<string, string>;
	setup_intent: { payment_method: string | null } | null;
};

/**
 * Puts the card from a completed card-update page on its subscription.
 * Safe to call more than once. Returns the subscription id, or null when the
 * page wasn't a completed card update.
 */
export const applyCardUpdate = async (sessionId: string) => {
	const session = await stripeGet<StripeSetupSession>(
		`/checkout/sessions/${sessionId}`,
		{ 'expand[]': ['setup_intent'] },
	);

	const subscriptionId = session.metadata?.subscriptionId;
	const customerId = session.metadata?.customerId;
	const paymentMethod = session.setup_intent?.payment_method;

	if (
		session.mode !== 'setup' ||
		session.status !== 'complete' ||
		session.metadata?.purpose !== 'card_update' ||
		!subscriptionId ||
		!customerId ||
		!paymentMethod
	) {
		return null;
	}

	// The card was saved without a customer; give it to the subscription's
	// customer (already attached the second time round)
	const card = await stripeGet<{ customer: string | null }>(
		`/payment_methods/${paymentMethod}`,
	);

	if (!card.customer) {
		await stripePost(`/payment_methods/${paymentMethod}/attach`, {
			customer: customerId,
		});
	} else if (card.customer !== customerId) {
		return null;
	}

	await stripePost(`/subscriptions/${subscriptionId}`, {
		default_payment_method: paymentMethod,
	});

	return subscriptionId;
};

/** Verifies the Stripe-Signature header of a webhook call. */
export const verifyStripeWebhook = (
	payload: string,
	signatureHeader: string | null,
	toleranceSeconds = 300,
) => {
	const secret = process.env.STRIPE_WEBHOOK_SECRET || '';

	if (!secret || !signatureHeader) return false;

	const parts = Object.fromEntries(
		signatureHeader.split(',').map((part) => part.split('=') as [string, string]),
	);
	const timestamp = Number(parts.t);
	const signatures = signatureHeader
		.split(',')
		.filter((part) => part.startsWith('v1='))
		.map((part) => part.slice(3));

	if (!timestamp || !signatures.length) return false;

	if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

	const expected = crypto
		.createHmac('sha256', secret)
		.update(`${timestamp}.${payload}`)
		.digest('hex');

	return signatures.some(
		(signature) =>
			signature.length === expected.length &&
			crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)),
	);
};
