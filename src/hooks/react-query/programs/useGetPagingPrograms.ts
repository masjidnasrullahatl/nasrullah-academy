import { Programs } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	page: number;
	limit: number;
	keyword?: string;
};

export const useGetPagingPrograms = (params: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PROGRAMS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
			});

			const response = await fetchAuth(`/api/programs?${queryParams}`);

			const data: ApiPagingResponse<Programs> = await response.json();

			return data;
		},
	});
};
