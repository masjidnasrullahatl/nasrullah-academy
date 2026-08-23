import { Families, Students } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetStudentsQueryParams } from '@app/api/students/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type StudentWithRelations = Students & {
	family: Families;
	enrollments: Array<{
		id: string;
		class: {
			id: string;
			name: string;
		};
	}>;
};

export const useGetPagingStudents = (params: GetStudentsQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				familyId: params.familyId || '',
				classId: params.classId || '',
				gender: params.gender || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/students?${queryParams}`);

			const data: ApiPagingResponse<StudentWithRelations> = await response.json();

			return data;
		},
	});
};
