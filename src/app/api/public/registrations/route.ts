import { NextRequest, NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { catchZodError } from '@app/api/utils/catchZodError';
import { badRequest, internalServerError } from '@app/api/utils/response';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';
import { RULES_VERSION } from '@configs/schoolRules';

import { sendEmail } from '@helpers/email';
import { createClient } from '@helpers/prisma/server';
import { registrationReceivedEmail } from '@helpers/registrationEmails';
import {
	createCheckoutSession,
	isRegistrationCardEnabled,
} from '@helpers/stripe';

import {
	getNextFirstOfMonth,
	getRegistrationQuote,
	withCardFee,
} from '@utils/registrationPricing';

import { SubmitRegistrationSchema } from './types';

// Public registration form submission (no login)
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const payload = SubmitRegistrationSchema.parse(body);

		// Honeypot filled in: pretend it worked, store nothing
		if (payload.website) {
			return NextResponse.json({ data: { id: null }, error: null });
		}

		const prisma = createClient();

		const program = await prisma.programs.findFirst({
			where: {
				slug: payload.programSlug,
				status: 'ACTIVE',
				registrationOpen: true,
			},
		});

		if (!program) return badRequest('Registration is not open for this program');

		if (
			payload.preferredTime &&
			(!program.classTimes.includes(payload.preferredTime) ||
				program.fullClassTimes.includes(payload.preferredTime))
		) {
			return badRequest('That class time is full. Please choose another time.');
		}

		// Prices are always worked out on the server, never trusted from the form
		const quote = getRegistrationQuote({
			monthlyFees: program.monthlyFees.map(Number),
			registrationFee: Number(program.registrationFee),
			kids: payload.students.length,
			customMonthly: payload.customMonthlyFee,
		});

		// Card is the only way to pay whenever card payments are switched on
		const payByCard = isRegistrationCardEnabled() && quote.firstPayment > 0;

		const registration = await prisma.registrations.create({
			data: {
				programId: program.id,
				familyName: payload.fatherName,
				fatherName: payload.fatherName,
				motherName: payload.motherName,
				email: payload.email,
				phone: payload.phone,
				secondaryPhone: payload.secondaryPhone,
				address: payload.address,
				preferredTime: payload.preferredTime || null,
				notes: payload.notes || null,
				students: payload.students,
				studentCount: payload.students.length,
				monthlyFee: quote.monthly,
				registrationFee: quote.registration,
				amountDue: quote.firstPayment,
				payByCard,
				rulesAcceptedAt: new Date(),
				rulesSignature: payload.rulesSignature,
				rulesVersion: RULES_VERSION,
			},
		});

		const sendReceivedEmail = () =>
			sendEmail({
				to: payload.email,
				...registrationReceivedEmail(program.name, {
					familyName: payload.fatherName,
					students: payload.students,
					preferredTime: payload.preferredTime || null,
					payByCard,
					registrationFee: quote.registration,
					monthlyFee: quote.monthly,
					amountDue: quote.firstPayment,
				}),
			});

		if (!payByCard) {
			await sendReceivedEmail();

			return NextResponse.json({
				data: { id: registration.id, checkoutUrl: null },
				error: null,
			});
		}

		const origin = NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
		const thanksUrl = `${origin}/register/${program.slug}/thanks`;

		// This month's tuition (full, or the days left from the 16th) is paid
		// with the registration fee, and the monthly charge starts on the 1st.
		// Stripe needs that to be 48 hours away; registering in the last day
		// or two, Stripe works out the few days left itself instead.
		const nextFirst = getNextFirstOfMonth();
		const canDelayToFirst = nextFirst - Date.now() / 1000 > 49 * 60 * 60;
		const monthName = new Date(
			quote.firstMonth.year,
			quote.firstMonth.month - 1,
			1,
		).toLocaleString('en-US', { month: 'long' });

		let session: { id: string; url: string };

		try {
			session = await createCheckoutSession({
				registrationId: registration.id,
				email: payload.email,
				description: `${program.name} (${payload.students.length} ${
					payload.students.length === 1 ? 'child' : 'children'
				})`,
				monthlyAmount: quote.card.monthly,
				...(canDelayToFirst
					? {
							oneTimeAmount: quote.card.firstPayment,
							oneTimeName: `registration fee and ${monthName} tuition`,
							trialEnd: nextFirst,
						}
					: {
							oneTimeAmount: withCardFee(quote.registration),
							billingCycleAnchor: nextFirst,
						}),
				successUrl: `${thanksUrl}?paid=1`,
				cancelUrl: `${thanksUrl}?paid=0`,
			});
		} catch (error) {
			// Nothing was paid: don't keep a registration the parent can't finish
			console.log('Registration checkout error', error);
			await prisma.registrations.delete({ where: { id: registration.id } });

			return badRequest(
				'We could not open the card payment page. Please try again, or call the Academy office at 470-253-9391.',
			);
		}

		await prisma.registrations.update({
			where: { id: registration.id },
			data: { stripeSessionId: session.id },
		});

		await sendReceivedEmail();

		return NextResponse.json({
			data: { id: registration.id, checkoutUrl: session.url },
			error: null,
		});
	} catch (error) {
		console.log('Submit registration error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
}
