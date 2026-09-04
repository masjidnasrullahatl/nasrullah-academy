import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useSubmitMyHours = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payPeriodId: string) => {
			return fetchAuth('/api/teacher/me/submissions', {
				method: 'POST',
				body: JSON.stringify({ payPeriodId }),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER.MY_TIME_ENTRIES] });
		},
	});
};
