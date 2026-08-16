import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetFamilyDetail = (id?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.FAMILIES.GET_DETAIL, id],
		enabled: Boolean(id),
		queryFn: async () => {
			const response = await fetchAuth(`/api/families/${id}`);

			const data: ApiResponse<any> = await response.json();

			return data.data;
		},
	});
};
