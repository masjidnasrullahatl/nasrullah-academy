import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateProgramPayload } from '@app/api/programs/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateProgram = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProgramPayload) => {
			return fetchAuth('/api/programs', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.PROGRAMS.GET_PAGING],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CLASSES.GET_PAGING],
			});
		},
	});
};
