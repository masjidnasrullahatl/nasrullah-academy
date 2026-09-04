import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useDeletePayPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			return fetchAuth(`/api/pay-periods/${id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_PAGING] });
		},
	});
};
