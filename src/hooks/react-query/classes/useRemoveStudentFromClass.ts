import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseRemoveStudentFromClassParams = {
	classId: string;
	studentId: string;
};

export const useRemoveStudentFromClass = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseRemoveStudentFromClassParams) => {
			return fetchAuth(
				`/api/classes/${params.classId}/students?studentId=${params.studentId}`,
				{
					method: 'DELETE',
				},
			);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CLASSES.GET_DETAIL, variables.classId],
			});
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING] });
		},
	});
};
