import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateInvoicePayload } from '@app/api/invoices/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdateInvoiceParams = {
	id: string;
	data: UpdateInvoicePayload;
};

export const useUpdateInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateInvoiceParams) => {
			return fetchAuth(`/api/invoices/${params.id}`, {
				method: 'PUT',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES.GET_PAGING] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INVOICES.GET_DETAIL, variables.id],
			});
		},
	});
};
