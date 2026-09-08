import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateClassPayload } from '@app/api/classes/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdateClassParams = {
	id: string;
	data: UpdateClassPayload;
};

export const useUpdateClass = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateClassParams) => {
			return fetchAuth(`/api/classes/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CLASSES.GET_AVAILABLE_STUDENTS, variables.id],
			});
		},
	});
};
