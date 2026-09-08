import { useQuery } from '@tanstack/react-query';

import { TeacherMyProfile } from '@app/api/teacher/me/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetMyProfile = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.TEACHER.MY_PROFILE],
		queryFn: async () => {
			const response = await fetchAuth('/api/teacher/me');
			const data: ApiResponse<TeacherMyProfile> = await response.json();
			return data.data;
		},
	});
};
