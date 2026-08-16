import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateTeacherPayload } from '@app/api/teachers/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTeacherPayload) => {
			return fetchAuth('/api/teachers', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
