import {
	Classes,
	Enrollments,
	Families,
	Programs,
	Students,
	Teachers,
} from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetClassesQueryParams } from '@app/api/classes/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type ClassStudentRow = Enrollments & {
	student: Students & { family: Families };
};

export type ClassRow = Classes & {
	teacher: Teachers | null;
	program: Programs;
	enrollments: ClassStudentRow[];
	studentCount: number;
	boysCount: number;
	girlsCount: number;
};

export const useGetPagingClasses = (params: GetClassesQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CLASSES.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				teacherId: params.teacherId || '',
				programId: params.programId || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/classes?${queryParams}`);
			const data: ApiPagingResponse<ClassRow> = await response.json();

			return data;
		},
	});
};
