import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { ProgramHoursInput } from '../timesheets/types';

type Params = {
	payPeriodId: string;
	hours: ProgramHoursInput;
	submit: boolean;
};

export const useSaveMyTimesheet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Params) => {
			return fetchAuth('/api/teacher/me/timesheet', {
				method: 'PUT',
				body: JSON.stringify(params),
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.TEACHER.MY_TIMESHEET],
			}),
	});
};
