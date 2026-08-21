import { PayrollEntries, PayrollPeriods, PayrollStatus, Teachers } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetPayrollPeriodsQueryParams } from '@app/api/payroll-periods/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type PayrollEntryRow = PayrollEntries & {
	teacher: Teachers;
	hourlyRate: number;
	weekdayHours: number;
	weekendHours: number;
	weekdayPay: number;
	weekendPay: number;
	totalPay: number;
};

export type PayrollPeriodRow = PayrollPeriods & {
	entries: PayrollEntryRow[];
	teacherCount: number;
	totalWeekdayPay: number;
	totalWeekendPay: number;
	totalPay: number;
	status: PayrollStatus;
};

export const useGetPagingPayrollPeriods = (params: GetPayrollPeriodsQueryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.PAYROLL.PERIODS, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				year: params.year?.toString() || '',
				month: params.month?.toString() || '',
				status: params.status || '',
				keyword: params.keyword || '',
			});

			const response = await fetchAuth(`/api/payroll-periods?${queryParams.toString()}`);
			const data: ApiPagingResponse<PayrollPeriodRow> = await response.json();

			return data;
		},
	});
};
