import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	payPeriodId: string;
};

export const useGeneratePay = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ payPeriodId }: Params) => {
			return fetchAuth(`/api/pay-periods/${payPeriodId}/generate`, {
				method: 'POST',
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_PAGING] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.PAY_PERIODS.GET_ONE, variables.payPeriodId],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.PAY_PERIODS.GET_SUBMISSIONS, variables.payPeriodId],
			});
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIME_ENTRIES.GET_PAGING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_RECORDS.GET_PAGING] });
		},
	});
};
