import { QueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

// Student rows show milestone counts, so refresh them along with the list
export const invalidateMilestoneQueries = (queryClient: QueryClient) =>
	Promise.all([
		queryClient.invalidateQueries({
			queryKey: [QUERY_KEYS.MILESTONES.GET_PAGING],
		}),
		queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MILESTONES.BOOKS] }),
		queryClient.invalidateQueries({
			queryKey: [QUERY_KEYS.STUDENTS.GET_PAGING],
		}),
	]);
