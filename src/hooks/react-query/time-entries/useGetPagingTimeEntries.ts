import { useQuery } from '@tanstack/react-query';

import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type StaffTimeEntryRow = {
	id: string;
	date: string;
	hours: number;
	notes: string | null;
	teacherId: string;
	classId: string;
	payPeriodId: string;
	teacher: {
		id: string;
		firstName: string;
		lastName: string;
	};
	class: {
		id: string;
		name: string;
		program: {
			id: string;
			name: string;
		};
	};
	payPeriod: {
		id: string;
		name: string;
		status: 'OPEN' | 'LOCKED' | 'PAID';
		startDate: string;
		endDate: string;
	};
	createdAt: string;
	updatedAt: string;
};

type Params = {
	page: number;
	limit: number;
	payPeriodId?: string;
	teacherId?: string;
};

export const useGetPagingTimeEntries = (params: Params) => {
	return useQuery({
		queryKey: [QUERY_KEYS.TIME_ENTRIES.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				payPeriodId: params.payPeriodId || '',
				teacherId: params.teacherId || '',
			});

			const response = await fetchAuth(`/api/time-entries?${queryParams}`);
			const payload: ApiPagingResponse<StaffTimeEntryRow> = await response.json();

			return payload;
		},
	});
};
