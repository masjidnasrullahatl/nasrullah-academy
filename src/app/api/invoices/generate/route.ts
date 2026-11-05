import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { internalServerError, success } from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { generateMonth } from '../generateMonth';

import { GenerateInvoicesSchema } from './types';

const generateInvoices = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = GenerateInvoicesSchema.parse(body);

		const prisma = createClient();

		const result = await generateMonth(
			prisma,
			data.year,
			data.month,
			data.programId,
		);

		return success(result);
	} catch (error) {
		console.log('Generate invoices error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const POST = withStaff(generateInvoices);
