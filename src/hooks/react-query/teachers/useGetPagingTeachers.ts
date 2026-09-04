import { Classes } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetTeachersQueryParams } from '@app/api/teachers/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type TeacherRow = {
	id: string;
	firstName: string;
	lastName: string;
	phoneNumber: string | null;
	email: string | null;
	hourlyRate: number | null;
	supabaseUserId: string | null;
	status: 'ACTIVE' | 'INACTIVE';
	createdAt: string;
	updatedAt: string;
	hasAccount: boolean;
	classes: Classes[];
	_count: { classes: number };
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
