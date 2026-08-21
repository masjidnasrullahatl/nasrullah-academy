import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { PayrollPeriodRow } from './useGetPagingPayrollPeriods';

export const useGetPayrollPeriodDetail = (id?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAYROLL.ENTRIES, id],
		enabled: Boolean(id),
		queryFn: async () => {
			const response = await fetchAuth(`/api/payroll-periods/${id}`);
			const data: ApiResponse<PayrollPeriodRow> = await response.json();

			return data.data;
		},
	});
};
