import { useQuery } from '@tanstack/react-query';

import { GetClassesQueryParams } from '@app/api/classes/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetPagingClasses = (params: GetClassesQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CLASSES.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				programId: params.programId || '',
				teacherId: params.teacherId || '',
				schoolYear: params.schoolYear?.toString() || '',
				session: params.session || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/classes?${queryParams}`);
			const data: ApiPagingResponse<any> = await response.json();

			return data;
		},
	});
};
