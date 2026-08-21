import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetDashboardYears = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.DASHBOARD.YEARS],
		queryFn: async () => {
			const response = await fetchAuth('/api/dashboard/years');
			const data: ApiResponse<number[]> = await response.json();

			return data.data;
		},
	});
};
