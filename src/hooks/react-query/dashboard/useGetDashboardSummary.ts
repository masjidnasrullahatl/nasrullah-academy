import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type DashboardSummary = {
	totals: {
		students: number;
		families: number;
		boys: number;
		girls: number;
		teachers: number;
		classes: number;
		income: number;
		unpaidBalance: number;
	};
	monthly: Array<{
		month: number;
		label: string;
		students: number;
		income: number;
		unpaidBalance: number;
	}>;
	genderSplit: { boys: number; girls: number };
	paymentStatus: Array<{ status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'NA'; count: number; amount: number }>;
	payMethodSplit: Array<{
		method: 'KEELA' | 'ZELLE' | 'CASH' | 'CASHAPP' | 'CHECK' | 'FREE' | 'OTHER' | 'NA';
		count: number;
		amount: number;
	}>;
	topUnpaidFamilies: Array<{ familyId: string; name: string; balance: number }>;
};

type SummaryParams = {
	year: number;
	programId?: string;
};

export const useGetDashboardSummary = (params: SummaryParams) => {
	return useQuery({
		queryKey: [QUERY_KEYS.DASHBOARD.SUMMARY, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				year: String(params.year),
				programId: params.programId || '',
			});
			const response = await fetchAuth(`/api/dashboard/summary?${queryParams.toString()}`);
			const data: ApiResponse<DashboardSummary> = await response.json();

			return data.data;
		},
	});
};
