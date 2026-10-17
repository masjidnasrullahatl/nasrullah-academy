import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FamilySubscriptionsResponse } from '@app/api/subscriptions/types';
import { ApiResponse } from '@app/api/types/common';

import { QUERY_KEYS } from '@configs/query-key';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export const useGetFamilySubscriptions = (familyId?: string) =>
	useQuery({
		queryKey: [QUERY_KEYS.SUBSCRIPTIONS.FAMILY, familyId],
		enabled: Boolean(familyId),
		queryFn: async () => {
			const response = await fetchAuth(`/api/families/${familyId}/subscriptions`);
			const data: ApiResponse<FamilySubscriptionsResponse> =
				await response.json();

			return data.data;
		},
	});

// Refreshes the family's recurring payments after any change
const useRefresh = () => {
	const queryClient = useQueryClient();

	return () =>
		queryClient.invalidateQueries({
			queryKey: [QUERY_KEYS.SUBSCRIPTIONS.FAMILY],
		});
};

export const useLinkSubscription = () => {
	const refresh = useRefresh();

	return useMutation({
		mutationFn: async (params: {
			familyId: string;
			stripeSubscriptionId: string;
			programId: string | null;
		}) =>
			fetchAuth(`/api/families/${params.familyId}/subscriptions`, {
				method: 'POST',
				body: JSON.stringify({
					stripeSubscriptionId: params.stripeSubscriptionId,
					programId: params.programId,
				}),
			}),
		onSuccess: refresh,
	});
};

export const useUnlinkSubscription = () => {
	const refresh = useRefresh();

	return useMutation({
		mutationFn: async (params: { familyId: string; linkId: string }) =>
			fetchAuth(
				`/api/families/${params.familyId}/subscriptions/${params.linkId}`,
				{ method: 'DELETE' },
			),
		onSuccess: refresh,
	});
};

export const useUpdateSubscriptionAmount = () => {
	const refresh = useRefresh();

	return useMutation({
		mutationFn: async (params: { subscriptionId: string; amount: number }) =>
			fetchAuth(`/api/subscriptions/${params.subscriptionId}`, {
				method: 'PATCH',
				body: JSON.stringify({ amount: params.amount }),
			}),
		onSuccess: refresh,
	});
};

export const useCancelSubscription = () => {
	const refresh = useRefresh();

	return useMutation({
		mutationFn: async (params: {
			subscriptionId: string;
			when: 'period_end' | 'now' | 'resume';
		}) =>
			fetchAuth(`/api/subscriptions/${params.subscriptionId}/cancel`, {
				method: 'POST',
				body: JSON.stringify({ when: params.when }),
			}),
		onSuccess: refresh,
	});
};

export const useCreateCardUpdateLink = () =>
	useMutation({
		mutationFn: async (subscriptionId: string) => {
			const response = await fetchAuth(
				`/api/subscriptions/${subscriptionId}/card-update`,
				{ method: 'POST' },
			);
			const data: ApiResponse<{ url: string; expiresAt: number }> =
				await response.json();

			return data.data;
		},
	});
