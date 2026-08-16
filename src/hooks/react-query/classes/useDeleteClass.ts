import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeleteClassParams = { id: string };

export const useDeleteClass = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeleteClassParams) => {
			return fetchAuth(`/api/classes/${params.id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
