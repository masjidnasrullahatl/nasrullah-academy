import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { TimesheetRow } from './types';

export const useGetPeriodTimesheets = (payPeriodId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAY_PERIODS.GET_TIMESHEETS, payPeriodId],
		enabled: Boolean(payPeriodId),
		queryFn: async () => {
			const response = await fetchAuth(
				`/api/pay-periods/${payPeriodId}/timesheets`,
			);
			const data: ApiResponse<TimesheetRow[]> = await response.json();

			return data.data || [];
		},
	});
};
