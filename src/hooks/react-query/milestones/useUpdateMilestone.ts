import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UpdateMilestonePayload } from '@app/api/milestones/types';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { invalidateMilestoneQueries } from './invalidateMilestoneQueries';

type UseUpdateMilestoneParams = {
	id: string;
	data: UpdateMilestonePayload;
};

export const useUpdateMilestone = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UseUpdateMilestoneParams) => {
			return fetchAuth(`/api/milestones/${params.id}`, {
				method: 'PATCH',
				body: JSON.stringify(params.data),
			});
		},
		onSuccess: () => invalidateMilestoneQueries(queryClient),
	});
};
