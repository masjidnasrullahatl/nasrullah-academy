import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type TeacherPayPeriod = {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	status: 'OPEN' | 'LOCKED' | 'PAID';
};

export const useGetTeacherPayPeriods = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHER.MY_TIME_ENTRIES, 'pay-periods'],
		queryFn: async () => {
			const response = await fetchAuth('/api/teacher/me/pay-periods');
			const data: ApiResponse<TeacherPayPeriod[]> = await response.json();
			return data.data;
		},
	});
};
