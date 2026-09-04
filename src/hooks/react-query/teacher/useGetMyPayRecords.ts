import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type MyPayRecord = {
	id: string;
	totalHours: number;
	hourlyRate: number;
	totalPay: number;
	payPeriod: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
		status: 'OPEN' | 'LOCKED' | 'PAID';
	};
};

export const useGetMyPayRecords = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHER.MY_PAY_RECORDS],
		queryFn: async () => {
			const response = await fetchAuth('/api/teacher/me/pay-records');
			const data: ApiResponse<MyPayRecord[]> = await response.json();
			return data.data;
		},
	});
};
