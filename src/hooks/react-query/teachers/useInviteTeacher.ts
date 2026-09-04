import { notifications } from '@mantine/notifications';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseInviteTeacherParams = {
	id: string;
};

export const useInviteTeacher = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseInviteTeacherParams) => {
			return fetchAuth(`/api/teachers/${params.id}/invite`, {
				method: 'POST',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			notifications.show({
				title: 'Invite sent',
				message: 'Teacher account invite sent successfully',
				color: 'green',
			});
		},
	});
};
