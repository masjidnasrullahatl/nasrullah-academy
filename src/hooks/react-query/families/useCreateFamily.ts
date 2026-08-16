import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateFamilyPayload } from '@app/api/families/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateFamily = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateFamilyPayload) => {
			return fetchAuth('/api/families', {
				method: 'POST',
				body: JSON.stringify(data),
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
