import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeleteInvoiceParams = {
	id: string;
};

export const useDeleteInvoice = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeleteInvoiceParams) => {
			return fetchAuth(`/api/invoices/${params.id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES.GET_PAGING] });
		},
	});
};
