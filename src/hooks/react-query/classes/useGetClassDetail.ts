import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetClassDetail = (id?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CLASSES.GET_DETAIL, id],
		enabled: Boolean(id),
		queryFn: async () => {
			const response = await fetchAuth(`/api/classes/${id}`);
			const data: ApiResponse<any> = await response.json();

			return data.data;
		},
	});
};
