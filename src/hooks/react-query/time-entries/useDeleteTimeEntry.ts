import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useDeleteTimeEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			return fetchAuth(`/api/time-entries/${id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIME_ENTRIES.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_ONE] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_SUBMISSIONS] });
		},
	});
};
