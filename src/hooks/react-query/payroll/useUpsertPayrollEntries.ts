import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpsertPayrollEntriesPayload } from '@app/api/payroll-periods/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseUpsertPayrollEntriesParams = {
	periodId: string;
	data: UpsertPayrollEntriesPayload;
};

export const useUpsertPayrollEntries = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpsertPayrollEntriesParams) => {
			return fetchAuth(`/api/payroll-periods/${params.periodId}/entries`, {
				method: 'POST',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.PERIODS] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYROLL.ENTRIES, variables.periodId] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD.SUMMARY] });
		},
	});
};
