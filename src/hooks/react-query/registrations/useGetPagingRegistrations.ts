import { RegistrationStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import type { RegistrationRow } from '@app/api/registrations/types';
import { ApiPagingResponse, PagingQueryParams } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type { RegistrationRow };

type Params = PagingQueryParams & {
	keyword?: string;
	status?: RegistrationStatus;
	programId?: string;
};

export const useGetPagingRegistrations = (params: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.REGISTRATIONS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				status: params.status || '',
				programId: params.programId || '',
			});

			const response = await fetchAuth(`/api/registrations?${queryParams}`);

			const data: ApiPagingResponse<RegistrationRow> & {
				pendingCount: number;
			} = await response.json();

			return data;
		},
	});
};
