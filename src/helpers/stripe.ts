import crypto from 'crypto';

// Stripe is called through its REST API, so no SDK is needed. Card payment
// switches on as soon as STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set
// in the hosting environment.
const STRIPE_API = 'https://api.stripe.com/v1';

const getSecretKey = () => process.env.STRIPE_SECRET_KEY || '';

export const isStripeEnabled = () => Boolean(getSecretKey());

const stripePost = async <T>(path: string, params: Record<string, string>) => {
	const response = await fetch(`${STRIPE_API}${path}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${getSecretKey()}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams(params),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data?.error?.message || 'Stripe request failed');
	}

	return data as T;
};

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
