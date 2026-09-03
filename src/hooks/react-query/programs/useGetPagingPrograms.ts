import { ArchiveStatus, Programs } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetProgramsQueryParams } from '@app/api/programs/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type ProgramRow = Programs & {
	_count: {
		classes: number;
		invoices: number;
	};
};

export type GetProgramsFilter = GetProgramsQueryParams & {
	status?: ArchiveStatus;
};

export const useGetPagingPrograms = (params: GetProgramsFilter) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PROGRAMS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				status: params.status || '',
			});

			const response = await fetchAuth(
				`/api/programs?${queryParams.toString()}`,
			);
			const data: ApiPagingResponse<ProgramRow> = await response.json();

			return data;
		},
	});
};
