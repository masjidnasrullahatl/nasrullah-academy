import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { invalidateMilestoneQueries } from './invalidateMilestoneQueries';

export const useDeleteMilestone = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { id: string }) => {
			return fetchAuth(`/api/milestones/${params.id}`, { method: 'DELETE' });
		},
		onSuccess: () => invalidateMilestoneQueries(queryClient),
	});
};
