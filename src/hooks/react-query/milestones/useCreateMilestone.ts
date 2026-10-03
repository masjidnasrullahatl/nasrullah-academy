import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateMilestonePayload } from '@app/api/milestones/types';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { invalidateMilestoneQueries } from './invalidateMilestoneQueries';

export const useCreateMilestone = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateMilestonePayload) => {
			return fetchAuth('/api/milestones', {
				method: 'POST',
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => invalidateMilestoneQueries(queryClient),
	});
};
