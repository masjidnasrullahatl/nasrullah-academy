import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateTeacherPayload } from '@app/api/teachers/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type CreateTeacherResponse = {
	id: string;
	hasAccount: boolean;
	inviteError: string | null;
};

export const useCreateTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTeacherPayload) => {
			const response = await fetchAuth('/api/teachers', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			const json: ApiResponse<CreateTeacherResponse> = await response.json();

			return json.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
		},
	});
};
