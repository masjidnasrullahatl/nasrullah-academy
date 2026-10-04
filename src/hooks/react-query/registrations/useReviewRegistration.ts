import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

type ReviewParams =
	| { id: string; action: 'approve'; familyId: string | null }
	| { id: string; action: 'reject' };

// Approving creates families, students and payment rows, so refresh those too
export const useReviewRegistration = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: ReviewParams) => {
			return fetchAuth(`/api/registrations/${params.id}/${params.action}`, {
				method: 'POST',
				body: JSON.stringify(
					params.action === 'approve' ? { familyId: params.familyId } : {},
				),
			});
		},
		onSuccess: () =>
			Promise.all(
				[
					QUERY_KEYS.REGISTRATIONS.GET_PAGING,
					QUERY_KEYS.REGISTRATIONS.GET_DETAIL,
					QUERY_KEYS.FAMILIES.GET_PAGING,
					QUERY_KEYS.STUDENTS.GET_PAGING,
					QUERY_KEYS.INVOICES.GET_PAGING,
				].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
			),
	});
};
