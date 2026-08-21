import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AddTeachersToPeriodPayload } from '@app/api/payroll-periods/types';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type UseAddTeachersToPeriodParams = {
	periodId: string;
	data: AddTeachersToPeriodPayload;
};

export const useAddTeachersToPeriod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseAddTeachersToPeriodParams) => {
			return fetchAuth(`/api/payroll-periods/${params.periodId}/entries`, {
				method: 'PUT',
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
