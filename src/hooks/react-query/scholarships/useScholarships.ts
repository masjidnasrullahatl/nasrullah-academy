import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	GetScholarshipsQueryParams,
	ScholarshipPayload,
} from '@app/api/scholarships/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type ScholarshipRow = {
	id: string;
	donorName: string | null;
	amountReceived: number;
	receivedAt: string | null;
	monthlyAmount: number;
	startMonth: string;
	endMonth: string | null;
	notes: string | null;
	studentId: string;
	student: {
		id: string;
		firstName: string;
		lastName: string;
		family: { id: string; name: string };
		programs: Array<{ id: string; name: string }>;
	};
};

export const useGetPagingScholarships = (params: GetScholarshipsQueryParams) =>
	useQuery({
		queryKey: [QUERY_KEYS.SCHOLARSHIPS.GET_PAGING, params],
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
			});

			const response = await fetchAuth(`/api/scholarships?${queryParams}`);
			const data: ApiPagingResponse<ScholarshipRow> = await response.json();

			return data;
		},
	});

// Student rows show a scholarship badge, so refresh them along with the list
const useRefresh = () => {
	const queryClient = useQueryClient();

	return () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.SCHOLARSHIPS.GET_PAGING],
			}),
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING],
			}),
		]);
};

export const useSaveScholarship = () => {
	const refresh = useRefresh();

	return useMutation({
		mutationFn: async (params: { id?: string; data: ScholarshipPayload }) =>
			fetchAuth(
				params.id ? `/api/scholarships/${params.id}` : '/api/scholarships',
				{
					method: params.id ? 'PATCH' : 'POST',
					body: JSON.stringify(params.data),
				},
			),
		onSuccess: refresh,
	});
};

export const useDeleteScholarship = () => {
	const refresh = useRefresh();

	return useMutation({
		mutationFn: async (params: { id: string }) =>
			fetchAuth(`/api/scholarships/${params.id}`, { method: 'DELETE' }),
		onSuccess: refresh,
	});
};
