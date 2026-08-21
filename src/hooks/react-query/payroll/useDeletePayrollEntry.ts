import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseDeletePayrollEntryParams = {
	periodId: string;
	entryId: string;
};

export const useDeletePayrollEntry = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseDeletePayrollEntryParams) => {
			return fetchAuth(
				`/api/payroll-periods/${params.periodId}/entries?entryId=${params.entryId}`,
				{
					method: 'DELETE',
				},
			);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.PERIODS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.ENTRIES, variables.periodId] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD.SUMMARY] });
		},
	});
};
