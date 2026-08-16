import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateInvoicePayload } from '@app/api/invoices/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateInvoicePayload) => {
			return fetchAuth('/api/invoices', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES.GET_PAGING] });
		},
	});
};
