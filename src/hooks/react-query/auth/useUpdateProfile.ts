import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
	ProfilePayload,
	UpdateProfilePayload,
} from '@app/api/auth/profile/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateProfilePayload) => {
			const response = await fetchAuth('/api/auth/profile', {
				method: 'PUT',
				body: JSON.stringify(data),
			});

			const payload: ApiResponse<ProfilePayload> = await response.json();

			return payload.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.AUTH.PROFILE],
			});
		},
	});
};
