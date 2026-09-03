import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeleteProgramParams = {
	id: string;
};

export const useDeleteProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeleteProgramParams) => {
			return fetchAuth(`/api/programs/${params.id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.PROGRAMS.GET_PAGING],
			});
		},
	});
};
