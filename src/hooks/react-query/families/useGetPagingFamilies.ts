import { Families, Students } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetFamiliesQueryParams } from '@app/api/families/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type FamilyWithStats = Families & {
	students: Students[];
	studentCount: number;
	boysCount: number;
	girlsCount: number;
};

export const useGetPagingFamilies = (params: GetFamiliesQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.FAMILIES.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/families?${queryParams}`);

			const data: ApiPagingResponse<FamilyWithStats> = await response.json();

			return data;
		},
	});
};
