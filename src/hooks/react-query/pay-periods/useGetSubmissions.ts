import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type PayPeriodSubmission = {
	teacherId: string;
	teacherName: string;
	submitted: boolean;
	submittedAt: string | null;
	totalHours: number;
	classCount: number;
};

export const useGetSubmissions = (payPeriodId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAY_PERIODS.GET_SUBMISSIONS, payPeriodId],
		enabled: Boolean(payPeriodId),
		queryFn: async () => {
			const response = await fetchAuth(`/api/pay-periods/${payPeriodId}/submissions`);
			const payload: ApiResponse<PayPeriodSubmission[]> = await response.json();

			return payload.data;
		},
	});
};
