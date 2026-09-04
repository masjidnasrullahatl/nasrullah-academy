import { PayPeriodStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type PayPeriodRow = {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	status: PayPeriodStatus;
	createdAt: string;
	updatedAt: string;
	_count: {
		timeEntries: number;
		payRecords: number;
		submissions: number;
	};
};

type Params = {
	page: number;
	limit: number;
	keyword?: string;
	status?: PayPeriodStatus;
};

export const useGetPagingPayPeriods = (params: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAY_PERIODS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				status: params.status || '',
			});

			const response = await fetchAuth(`/api/pay-periods?${queryParams}`);
			const data: ApiPagingResponse<PayPeriodRow> = await response.json();

			return data;
		},
	});
};
