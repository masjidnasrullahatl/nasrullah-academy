import { useQuery } from '@tanstack/react-query';

import type { RegistrationRow } from '@app/api/registrations/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type RegistrationDetail = RegistrationRow & {
	matchedFamily: { id: string; name: string } | null;
};

export const useGetRegistrationDetail = (id: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.REGISTRATIONS.GET_DETAIL, id],
		queryFn: async () => {
			const response = await fetchAuth(`/api/registrations/${id}`);

			const data: ApiResponse<RegistrationDetail> = await response.json();

			return data.data;
		},
	});
};
