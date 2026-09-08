import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseGetInviteLinkParams = {
	id: string;
};

export const useGetInviteLink = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseGetInviteLinkParams) => {
			const response = await fetchAuth(
				`/api/teachers/${params.id}/invite-link`,
				{ method: 'POST' },
			);
			const json: ApiResponse<{ link: string }> = await response.json();

			return json.data.link;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING],
			});
		},
	});
};
