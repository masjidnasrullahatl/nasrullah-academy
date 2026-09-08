import { PayPeriodStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type PayRecordRow = {
	id: string;
	totalHours: number;
	hourlyRate: number;
	totalPay: number;
	teacherId: string;
	payPeriodId: string;
	teacher: {
		id: string;
		firstName: string;
		lastName: string;
	};
	payPeriod: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
		status: PayPeriodStatus;
	};
	createdAt: string;
	updatedAt: string;
};

type PayRecordsResponse = {
	data: PayRecordRow[];
	total: number;
	summary: {
		totalHours: number;
		totalPay: number;
	};
	error: string | null;
};

type Params = {
	page: number;
	limit: number;
	payPeriodId?: string;
	teacherId?: string;
};

export const useGetPagingPayRecords = (params: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAY_RECORDS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				payPeriodId: params.payPeriodId || '',
				teacherId: params.teacherId || '',
			});

			const response = await fetchAuth(`/api/pay-records?${queryParams}`);
			const payload: PayRecordsResponse = await response.json();

			return payload;
		},
	});
};
