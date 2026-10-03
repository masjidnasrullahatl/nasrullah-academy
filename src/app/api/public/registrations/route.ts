import { NextRequest, NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { catchZodError } from '@app/api/utils/catchZodError';
import { badRequest, internalServerError } from '@app/api/utils/response';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';

import { createClient } from '@helpers/prisma/server';
import { createCheckoutSession, isStripeEnabled } from '@helpers/stripe';

import { getRegistrationQuote } from '@utils/registrationPricing';

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

		// Prices are always worked out on the server, never trusted from the form
		const quote = getRegistrationQuote({
			monthlyFees: program.monthlyFees.map(Number),
			registrationFee: Number(program.registrationFee),
			kids: payload.students.length,
		});

		const payByCard =
			payload.payByCard && isStripeEnabled() && quote.firstPayment > 0;

		const registration = await prisma.registrations.create({
			data: {
				programId: program.id,
				parentFirstName: payload.parentFirstName,
				parentLastName: payload.parentLastName,
				email: payload.email,
				phone: payload.phone,
				emergencyPhone: payload.emergencyPhone || null,
				address: payload.address,
				preferredTime: payload.preferredTime || null,
				notes: payload.notes || null,
				students: payload.students,
				studentCount: payload.students.length,
				monthlyFee: quote.monthly,
				registrationFee: quote.registration,
				amountDue: quote.firstPayment,
				payByCard,
			},
		});

		if (!payByCard) {
			return NextResponse.json({
				data: { id: registration.id, checkoutUrl: null },
				error: null,
			});
		}

		const origin = NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
		const thanksUrl = `${origin}/register/${program.slug}/thanks`;

		const session = await createCheckoutSession({
			registrationId: registration.id,
			email: payload.email,
			description: `${program.name} (${payload.students.length} ${
				payload.students.length === 1 ? 'child' : 'children'
			})`,
			monthlyAmount: quote.card.monthly,
			oneTimeAmount: Math.max(quote.card.firstPayment - quote.card.monthly, 0),
			successUrl: `${thanksUrl}?paid=1`,
			cancelUrl: `${thanksUrl}?paid=0`,
		});

		await prisma.registrations.update({
			where: { id: registration.id },
			data: { stripeSessionId: session.id },
		});

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
