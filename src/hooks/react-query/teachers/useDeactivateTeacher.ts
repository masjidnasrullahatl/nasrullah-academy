import { notifications } from '@mantine/notifications';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeactivateTeacherParams = {
	id: string;
};

export const useDeactivateTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeactivateTeacherParams) => {
			return fetchAuth(`/api/teachers/${params.id}/deactivate`, {
				method: 'PATCH',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			notifications.show({
				title: 'Teacher deactivated',
				message: 'Teacher account deactivated successfully',
				color: 'green',
			});
		},
	});
};
