import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdatePayrollPeriodPayload } from '@app/api/payroll-periods/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpdatePayrollPeriodParams = {
	id: string;
	data: UpdatePayrollPeriodPayload;
};

export const useUpdatePayrollPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdatePayrollPeriodParams) => {
			return fetchAuth(`/api/payroll-periods/${params.id}`, {
				method: 'PUT',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.PERIODS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.ENTRIES, variables.id] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD.SUMMARY] });
		},
	});
};
