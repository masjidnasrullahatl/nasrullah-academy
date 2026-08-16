import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateStudentPayload } from '@app/api/students/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreateStudent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateStudentPayload) => {
			return fetchAuth('/api/students', {
				method: 'POST',
				body: JSON.stringify(data),
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
