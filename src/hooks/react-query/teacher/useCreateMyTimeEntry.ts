import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateTimeEntryPayload } from '@app/api/teacher/me/time-entries/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateMyTimeEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTimeEntryPayload) => {
			return fetchAuth('/api/teacher/me/time-entries', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER.MY_TIME_ENTRIES] });
		},
	});
};
