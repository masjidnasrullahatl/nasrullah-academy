import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeleteTeacherParams = {
	id: string;
};

export const useDeleteTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeleteTeacherParams) => {
			return fetchAuth(`/api/teachers/${params.id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
