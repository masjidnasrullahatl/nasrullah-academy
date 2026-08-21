import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeletePayrollPeriodParams = {
	id: string;
};

export const useDeletePayrollPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeletePayrollPeriodParams) => {
			return fetchAuth(`/api/payroll-periods/${params.id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.PERIODS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.ENTRIES] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD.SUMMARY] });
		},
	});
};
