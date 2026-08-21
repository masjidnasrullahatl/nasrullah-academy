import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreatePayrollPeriodPayload } from '@app/api/payroll-periods/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useCreatePayrollPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePayrollPeriodPayload) => {
			return fetchAuth('/api/payroll-periods', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.PERIODS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.ENTRIES] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD.SUMMARY] });
		},
	});
};
