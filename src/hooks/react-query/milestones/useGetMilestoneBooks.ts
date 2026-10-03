import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetMilestoneBooks = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.MILESTONES.BOOKS],
		queryFn: async () => {
			const response = await fetchAuth('/api/milestones/books');

			const data: ApiResponse<string[]> = await response.json();

			return data.data || [];
		},
	});
};
