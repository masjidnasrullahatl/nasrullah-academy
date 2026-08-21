import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AssignStudentsPayload } from '@app/api/classes/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseAssignStudentsToClassParams = {
	classId: string;
	data: AssignStudentsPayload;
};

export const useAssignStudentsToClass = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseAssignStudentsToClassParams) => {
			return fetchAuth(`/api/classes/${params.classId}/students`, {
				method: 'POST',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES.GET_PAGING] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CLASSES.GET_AVAILABLE_STUDENTS, variables.classId],
			});
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING] });
		},
	});
};
