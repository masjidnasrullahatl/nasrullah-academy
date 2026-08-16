import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeleteFamilyParams = {
	id: string;
};

export const useDeleteFamily = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeleteFamilyParams) => {
			return fetchAuth(`/api/families/${params.id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.FAMILIES.GET_PAGING],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING],
			});
		},
	});
};
