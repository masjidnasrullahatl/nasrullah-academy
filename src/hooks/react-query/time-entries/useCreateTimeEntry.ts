import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateTimeEntryPayload } from '@app/api/time-entries/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateTimeEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTimeEntryPayload) => {
			return fetchAuth('/api/time-entries', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIME_ENTRIES.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_ONE] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_SUBMISSIONS] });
		},
	});
};
