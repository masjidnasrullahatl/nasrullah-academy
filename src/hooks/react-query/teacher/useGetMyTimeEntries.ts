import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type MyTimeEntry = {
	id: string;
	date: string;
	hours: number;
	notes: string | null;
	class: {
		id: string;
		name: string;
		program: { name: string };
	};
	payPeriod: {
		id: string;
		name: string;
		status: 'OPEN' | 'LOCKED' | 'PAID';
		startDate: string;
		endDate: string;
	};
};

export type MyTimeEntriesResponse = {
	data: MyTimeEntry[];
	total: number;
	submittedAt: string | null;
};

export const useGetMyTimeEntries = (payPeriodId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHER.MY_TIME_ENTRIES, payPeriodId],
		enabled: Boolean(payPeriodId),
		queryFn: async () => {
			const query = new URLSearchParams({
				payPeriodId: payPeriodId || '',
			});
			const response = await fetchAuth(
				`/api/teacher/me/time-entries?${query.toString()}`,
			);
			const payload: ApiResponse<MyTimeEntriesResponse> = await response.json();
			return payload.data;
		},
	});
};
