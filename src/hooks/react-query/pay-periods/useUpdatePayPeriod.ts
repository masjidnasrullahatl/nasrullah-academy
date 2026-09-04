import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdatePayPeriodPayload } from '@app/api/pay-periods/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type Params = {
	id: string;
	data: UpdatePayPeriodPayload;
};

export const useUpdatePayPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Params) => {
			return fetchAuth(`/api/pay-periods/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAY_PERIODS.GET_PAGING] });
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.PAY_PERIODS.GET_ONE, variables.id],
			});
		},
	});
};
