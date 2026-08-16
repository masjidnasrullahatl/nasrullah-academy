import { Programs } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetProgramsQueryParams } from '@app/api/programs/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type ProgramRow = Programs & {
	_count: {
		classes: number;
		enrollments: number;
	};
};

export const useGetPagingPrograms = (params: GetProgramsQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PROGRAMS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/programs?${queryParams}`);

			const data: ApiPagingResponse<ProgramRow> = await response.json();

			return data;
		},
	});
};
