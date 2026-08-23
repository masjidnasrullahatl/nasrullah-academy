import { PaymentStatus, PayMethod } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetInvoicesQueryParams = PagingQueryParams & {
	year?: number;
	month?: number;
	paymentStatus?: PaymentStatus;
	payMethod?: PayMethod;
	familyId?: string;
	keyword?: string;
};

export const InvoiceFeeFields = {
	registrationFee: z.number().min(0).default(0),
	tuitionFee: z.number().min(0).default(0),
	bookFee: z.number().min(0).default(0),
	paidRegistrationFee: z.number().min(0).default(0),
	paidTuitionFee: z.number().min(0).default(0),
	paidBookFee: z.number().min(0).default(0),
	extraPaid: z.number().min(0).default(0),
};

export const CreateInvoiceSchema = z.object({
	familyId: z.string().min(1, 'Family is required'),
	year: z.number().int().min(2000).max(2100),
	month: z.number().int().min(1).max(12),
	studentCount: z.number().int().min(0).default(0),
	session: z.enum(['AM', 'PM', 'AM_PM', 'NA']).optional().nullable(),
	...InvoiceFeeFields,
	payMethod: z
		.enum(['KEELA', 'ZELLE', 'CASH', 'CASHAPP', 'SQUARE', 'CHECK', 'FREE', 'OTHER', 'NA'])
		.default('NA'),
	paymentStatus: z.enum(['PAID', 'PARTIAL', 'UNPAID', 'NA']).default('UNPAID'),
	paidAt: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.omit({
	familyId: true,
});

export type CreateInvoicePayload = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoicePayload = z.infer<typeof UpdateInvoiceSchema>;
