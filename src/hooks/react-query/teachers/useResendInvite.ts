import { notifications } from '@mantine/notifications';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseResendInviteParams = {
	id: string;
};

export const useResendInvite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseResendInviteParams) => {
			return fetchAuth(`/api/teachers/${params.id}/resend-invite`, {
				method: 'POST',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING] });
			notifications.show({
				title: 'Invite resent',
				message: 'Teacher invite email resent successfully',
				color: 'green',
			});
		},
	});
};
