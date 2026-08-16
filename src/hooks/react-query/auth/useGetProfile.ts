import { useQuery } from '@tanstack/react-query';

import { ProfilePayload } from '@app/api/auth/profile/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { useAuth } from '@hooks/useAuth';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetProfile = () => {
	const { isAuthenticated, isFetched } = useAuth();

	return useQuery({
		queryKey: [QUERY_KEYS.AUTH.PROFILE],
		enabled: isFetched && isAuthenticated,
		queryFn: async () => {
			const response = await fetchAuth('/api/auth/profile');

			const profile: ApiResponse<ProfilePayload> = await response.json();

			return profile.data;
		},
	});
};
