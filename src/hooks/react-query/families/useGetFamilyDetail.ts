import {
	Classes,
	Enrollments,
	Families,
	Programs,
	Students,
	Teachers,
} from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type FamilyStudentEnrollment = Enrollments & {
	class: Classes & { teacher: Teachers | null };
	program: Programs;
};

export type FamilyStudent = Students & {
	enrollments: FamilyStudentEnrollment[];
};

export type FamilyDetail = Families & {
	students: FamilyStudent[];
};

export const useGetFamilyDetail = (id?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.FAMILIES.GET_DETAIL, id],
		enabled: Boolean(id),
		queryFn: async () => {
			const response = await fetchAuth(`/api/families/${id}`);

			const data: ApiResponse<FamilyDetail> = await response.json();

			return data.data;
		},
	});
};
