import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreatePayPeriodPayload } from '@app/api/pay-periods/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreatePayPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePayPeriodPayload) => {
			return fetchAuth('/api/pay-periods', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_PAGING] });
		},
	});
};
