import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateTeacherProfilePayload } from '@app/api/teacher/me/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useUpdateMyProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateTeacherProfilePayload) => {
			return fetchAuth('/api/teacher/me', {
				method: 'PATCH',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER.MY_PROFILE] });
		},
	});
};
