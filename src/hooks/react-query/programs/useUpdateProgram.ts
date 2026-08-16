import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateProgramPayload } from '@app/api/programs/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdateProgramParams = {
	id: string;
	data: UpdateProgramPayload;
};

export const useUpdateProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateProgramParams) => {
			return fetchAuth(`/api/programs/${params.id}`, {
				method: 'PUT',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRAMS.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
