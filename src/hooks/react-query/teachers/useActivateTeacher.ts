import { notifications } from '@mantine/notifications';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseActivateTeacherParams = {
	id: string;
};

export const useActivateTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseActivateTeacherParams) => {
			return fetchAuth(`/api/teachers/${params.id}/activate`, {
				method: 'PATCH',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			notifications.show({
				title: 'Teacher activated',
				message: 'Teacher account activated successfully',
				color: 'green',
			});
		},
	});
};
