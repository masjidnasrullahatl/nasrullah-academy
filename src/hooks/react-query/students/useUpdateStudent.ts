import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateStudentPayload } from '@app/api/students/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdateStudentParams = {
	id: string;
	data: UpdateStudentPayload;
};

export const useUpdateStudent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateStudentParams) => {
			return fetchAuth(`/api/students/${params.id}`, {
				method: 'PUT',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.FAMILIES.GET_PAGING],
			});
		},
	});
};
