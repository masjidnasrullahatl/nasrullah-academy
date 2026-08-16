import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateFamilyPayload } from '@app/api/families/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdateFamilyParams = {
	id: string;
	data: UpdateFamilyPayload;
};

export const useUpdateFamily = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateFamilyParams) => {
			return fetchAuth(`/api/families/${params.id}`, {
				method: 'PUT',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.FAMILIES.GET_PAGING],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.FAMILIES.GET_DETAIL, variables.id],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING],
			});
		},
	});
};
