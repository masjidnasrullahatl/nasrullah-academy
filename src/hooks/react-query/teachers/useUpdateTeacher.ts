import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateTeacherPayload } from '@app/api/teachers/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdateTeacherParams = {
	id: string;
	data: UpdateTeacherPayload;
};

export const useUpdateTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateTeacherParams) => {
			return fetchAuth(`/api/teachers/${params.id}`, {
				method: 'PUT',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
