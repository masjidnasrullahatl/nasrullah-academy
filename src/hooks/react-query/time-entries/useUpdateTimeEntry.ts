import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateTimeEntryPayload } from '@app/api/time-entries/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	id: string;
	data: UpdateTimeEntryPayload;
};

export const useUpdateTimeEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Params) => {
			return fetchAuth(`/api/time-entries/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIME_ENTRIES.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_ONE] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_SUBMISSIONS] });
		},
	});
};
