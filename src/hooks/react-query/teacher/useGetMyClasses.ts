import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type MyClassRow = {
	id: string;
	name: string;
	program: { name: string };
	_count: { enrollments: number };
	enrollments: Array<{
		id: string;
		startDate: string;
		student: {
			id: string;
			firstName: string;
			lastName: string;
			gender: 'BOY' | 'GIRL';
			enrolledAt: string | null;
		};
	}>;
};

export const useGetMyClasses = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHER.MY_CLASSES],
		queryFn: async () => {
			const response = await fetchAuth('/api/teacher/me/classes');
			const data: ApiResponse<MyClassRow[]> = await response.json();
			return data.data;
		},
	});
};
