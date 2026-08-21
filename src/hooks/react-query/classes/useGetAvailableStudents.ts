import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	keyword?: string;
	programId?: string;
};

export const useGetAvailableStudents = (classId?: string, params?: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.CLASSES.GET_AVAILABLE_STUDENTS, classId, params],
		enabled: Boolean(classId),
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				keyword: params?.keyword || '',
				programId: params?.programId || '',
			});

			const response = await fetchAuth(
				`/api/classes/${classId}/students?${queryParams}`,
			);
			const data: ApiResponse<any[]> = await response.json();

			return data.data;
		},
	});
};
