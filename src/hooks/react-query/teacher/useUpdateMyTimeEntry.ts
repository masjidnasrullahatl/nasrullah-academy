import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateTimeEntryPayload } from '@app/api/teacher/me/time-entries/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	id: string;
	data: UpdateTimeEntryPayload;
};

export const useUpdateMyTimeEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Params) => {
			return fetchAuth(`/api/teacher/me/time-entries/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER.MY_TIME_ENTRIES] });
		},
	});
};
