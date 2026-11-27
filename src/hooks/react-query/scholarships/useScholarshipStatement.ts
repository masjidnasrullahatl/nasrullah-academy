import { useQuery } from '@tanstack/react-query';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

export type ScholarshipStatement = {
	year: number;
	month: number;
	donor: string;
	donors: string[];
	students: Array<{
		id: string;
		studentName: string;
		familyId: string;
		familyName: string;
		programs: string[];
		donorName: string | null;
		amountReceived: number;
		receivedAt: string | null;
		startMonth: string;
		endMonth: string | null;
		months: number;
		appliedThisMonth: number;
	}>;
	payments: Array<{
		id: string;
		familyName: string;
		programName: string;
		totalDue: number;
		totalPaid: number;
		balance: number;
		payMethod: string;
		paymentStatus: string;
		paidAt: string | null;
		notes: string | null;
	}>;
};

export const useScholarshipStatement = (params: {
	year?: number;
	month?: number;
	donor?: string;
}) =>
	useQuery({
		queryKey: ['scholarship-statement', params],
		enabled: Boolean(params.year && params.month),
		queryFn: async () => {
			const query = new URLSearchParams({
				year: String(params.year),
				month: String(params.month),
				donor: params.donor || '',
			});

			const response = await fetchAuth(`/api/scholarships/statement?${query}`);
			const result: { data: ScholarshipStatement } = await response.json();

			return result.data;
		},
	});
