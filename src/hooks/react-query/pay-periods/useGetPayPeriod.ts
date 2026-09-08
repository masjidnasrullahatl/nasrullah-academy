import { PayPeriodStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type PayPeriodDetail = {
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
	submissions: Array<{
		id: string;
		submittedAt: string;
		teacherId: string;
		teacher: {
			firstName: string;
			lastName: string;
		};
	}>;
};

export const useGetPayPeriod = (id?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAY_PERIODS.GET_ONE, id],
		enabled: Boolean(id),
		queryFn: async () => {
			const response = await fetchAuth(`/api/pay-periods/${id}`);
			const payload: ApiResponse<PayPeriodDetail> = await response.json();

			return payload.data;
		},
	});
};
