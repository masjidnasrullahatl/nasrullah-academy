import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';
import { payUnpaidInvoice } from '@helpers/stripe';

import { isLinkedSubscription } from '../../../../utils';

// Charges the card on file for a month the automatic payment missed
const pay = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ subscriptionId: string; invoiceId: string }>,
) => {
	try {
		const { subscriptionId, invoiceId } = await params;

		if (!(await isLinkedSubscription(createClient(), subscriptionId))) {
			return notFound('This subscription is not linked to an Academy family');
		}

		try {
			const invoice = await payUnpaidInvoice(subscriptionId, invoiceId);

			return success({ invoiceId, status: invoice.status });
		} catch (error) {
			return badRequest(
				error instanceof Error ? error.message : 'The card could not be charged',
			);
		}
	} catch (error) {
		console.log('Pay invoice error', error);

		return internalServerError();
	}
};

export const POST = withStaff(pay);
