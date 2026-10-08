import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { ProgramHoursInput } from './types';

type Params = {
	payPeriodId: string;
	teacherId: string;
	hours: ProgramHoursInput;
};

export const useUpdatePeriodTimesheet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ payPeriodId, teacherId, hours }: Params) => {
			return fetchAuth(
				`/api/pay-periods/${payPeriodId}/timesheets/${teacherId}`,
				{ method: 'PUT', body: JSON.stringify({ hours }) },
			);
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: [QUERY_KEYS.PAY_PERIODS.GET_TIMESHEETS],
				}),
				queryClient.invalidateQueries({
					queryKey: [QUERY_KEYS.PAY_PERIODS.GET_PAGING],
				}),
			]),
	});
};
