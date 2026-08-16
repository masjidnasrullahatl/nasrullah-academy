import { Classes, Programs } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	page: number;
	limit: number;
	keyword?: string;
	programId?: string;
};

export const useGetPagingClasses = (params: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CLASSES.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				programId: params.programId || '',
			});

			const response = await fetchAuth(`/api/classes?${queryParams}`);

			const data: ApiPagingResponse<Classes & { program: Programs }> =
				await response.json();

			return data;
		},
	});
};
