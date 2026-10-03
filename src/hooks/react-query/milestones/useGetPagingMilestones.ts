import { MilestoneType } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { GetMilestonesQueryParams } from '@app/api/milestones/types';
import { ApiPagingResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type MilestoneRow = {
	id: string;
	type: MilestoneType;
	juzNumber: number | null;
	bookName: string | null;
	completedAt: string;
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

export const useGetPagingMilestones = (
	params: GetMilestonesQueryParams,
	options: { enabled?: boolean } = {},
) => {
	return useQuery({
		queryKey: [QUERY_KEYS.MILESTONES.GET_PAGING, params],
		enabled: options.enabled ?? true,
		queryFn: async () => {
			const queryParams = new URLSearchParams({
				page: params.page.toString(),
				limit: params.limit.toString(),
				keyword: params.keyword || '',
				studentId: params.studentId || '',
				programId: params.programId || '',
				type: params.type || '',
				dateFrom: params.dateFrom || '',
				dateTo: params.dateTo || '',
			});

			const response = await fetchAuth(`/api/milestones?${queryParams}`);

			const data: ApiPagingResponse<MilestoneRow> = await response.json();

			return data;
		},
	});
};
