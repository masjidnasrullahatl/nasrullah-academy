import { useMutation, useQueryClient } from '@tanstack/react-query';

import { GenerateInvoicesPayload } from '@app/api/invoices/generate/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type GenerateInvoicesResponse = {
	created: number;
	skipped: number;
};

export const useGenerateInvoices = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: GenerateInvoicesPayload) => {
			const response = await fetchAuth('/api/invoices/generate', {
				method: 'POST',
				body: JSON.stringify(data),
			});
			const json: ApiResponse<GenerateInvoicesResponse> = await response.json();

			return json.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES.GET_PAGING] });
		},
	});
};
