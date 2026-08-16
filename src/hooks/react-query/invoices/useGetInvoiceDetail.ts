import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { InvoiceRow } from './useGetPagingInvoices';

export const useGetInvoiceDetail = (id?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.INVOICES.GET_DETAIL, id],
		enabled: Boolean(id),
		queryFn: async () => {
			const response = await fetchAuth(`/api/invoices/${id}`);
			const data: ApiResponse<InvoiceRow> = await response.json();

			return data.data;
		},
	});
};
