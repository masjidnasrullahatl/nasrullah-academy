import {
	ClassSession,
	Families,
	PaymentStatus,
	PayMethod,
} from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetInvoicesQueryParams } from '@app/api/invoices/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type InvoiceSummary = {
	studentCount: number;
	registrationFee: number;
	tuitionFee: number;
	bookFee: number;
	totalDue: number;
	paidRegistrationFee: number;
	paidTuitionFee: number;
	paidBookFee: number;
	extraPaid: number;
	totalPaid: number;
	balance: number;
};

export type InvoiceRow = {
	id: string;
	year: number;
	month: number;
	studentCount: number;
	session: ClassSession | null;
	registrationFee: number;
	tuitionFee: number;
	bookFee: number;
	totalDue: number;
	paidRegistrationFee: number;
	paidTuitionFee: number;
	paidBookFee: number;
	extraPaid: number;
	totalPaid: number;
	balance: number;
	payMethod: PayMethod;
	paymentStatus: PaymentStatus;
	paidAt: string | null;
	notes: string | null;
	familyId: string;
	family: Families;
};

export type InvoicesPagingResponse = ApiPagingResponse<InvoiceRow> & {
	summary: InvoiceSummary;
};

export const useGetPagingInvoices = (params: GetInvoicesQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.INVOICES.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				year: params.year?.toString() || '',
				month: params.month?.toString() || '',
				paymentStatus: params.paymentStatus || '',
				payMethod: params.payMethod || '',
				familyId: params.familyId || '',
				keyword: params.keyword || '',
			});

			const response = await fetchAuth(
				`/api/invoices?${queryParams.toString()}`,
			);
			const data: InvoicesPagingResponse = await response.json();

			return data;
		},
	});
};
