import { Classes, Programs, Teachers } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetTeachersQueryParams } from '@app/api/teachers/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type TeacherRow = Teachers & {
	classes: Array<Classes & { program: Programs }>;
	_count: { classes: number };
	hourlyRate: number;
};

export const useGetPagingTeachers = (params: GetTeachersQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHERS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/teachers?${queryParams}`);

			const data: ApiPagingResponse<TeacherRow> = await response.json();

			return data;
		},
	});
};
