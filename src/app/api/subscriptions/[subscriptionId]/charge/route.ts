import dayjs from 'dayjs';
import { ZodError } from 'zod/v4';

import { markMonthPaidByCard } from '@app/api/registrations/utils';
import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';
import { chargeCardOnFile } from '@helpers/stripe';

import { ChargeCardSchema } from '../../types';
import { findPaidMonth } from '../../utils';

/**
 * Charges the card on file once for a month (e.g. the automatic payment
 * failed or stopped) and marks that month paid in Monthly Payments.
 */
const charge = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ subscriptionId: string }>,
) => {
	try {
		const { subscriptionId } = await params;
		const payload = ChargeCardSchema.parse(await request.json());

		const prisma = createClient();

		const links = await prisma.familySubscriptions.findMany({
			where: { stripeSubscriptionId: subscriptionId, familyId: payload.familyId },
			include: { program: { select: { name: true } } },
		});

		if (!links.length) {
			return notFound('This recurring payment is not linked to this family');
		}

		if (!links.some((link) => link.isPayer)) {
			return badRequest('Another family pays this; charge it from their page');
		}

		const monthStart = Date.UTC(payload.year, payload.month - 1, 1) / 1000;
		const monthLabel = dayjs
			.unix(monthStart)
			.add(12, 'hour')
			.format('MMMM YYYY');

		const paidWith = await findPaidMonth(prisma, subscriptionId, monthStart);

		if (paidWith) {
			return badRequest(
				`${monthLabel} is already marked paid in Monthly Payments, so the card was not charged`,
			);
		}

		const programs = links
			.map((link) => link.program?.name)
			.filter(Boolean)
			.join(' & ');

		try {
			await chargeCardOnFile({
				subscriptionId,
				amount: payload.amount,
				description: `Nasrullah Academy${programs ? ` ${programs}` : ''} tuition - ${monthLabel}`,
				metadata: {
					familyId: payload.familyId,
					month: monthLabel,
				},
				idempotencyKey: `manual-${subscriptionId}-${payload.year}-${payload.month}`,
			});
		} catch (error) {
			return badRequest(
				error instanceof Error ? error.message : 'The card was not charged',
			);
		}

		for (const link of links) {
			if (!link.programId) continue;

			await markMonthPaidByCard(
				prisma,
				link.familyId,
				link.programId,
				payload.year,
				payload.month,
			);
		}

		return success({ subscriptionId, month: monthLabel });
	} catch (error) {
		console.log('Charge card error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const POST = withStaff(charge);
