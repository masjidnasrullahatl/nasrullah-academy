import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateClassPayload } from '@app/api/classes/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateClass = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateClassPayload) => {
			return fetchAuth('/api/classes', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
