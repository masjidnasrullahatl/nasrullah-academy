import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { TimesheetProgram } from '../timesheets/types';

export type MyTimesheet = {
	programs: TimesheetProgram[];
	totalHours: number;
	submittedAt: string | null;
};

export const useGetMyTimesheet = (payPeriodId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHER.MY_TIMESHEET, payPeriodId],
		enabled: Boolean(payPeriodId),
		queryFn: async () => {
			const response = await fetchAuth(
				`/api/teacher/me/timesheet?payPeriodId=${payPeriodId}`,
			);
			const data: ApiResponse<MyTimesheet> = await response.json();

			return data.data;
		},
	});
};
