import { useMutation } from '@tanstack/react-query';

import { GetInvoicesQueryParams } from '@app/api/invoices/types';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

const getFileNameFromHeader = (contentDisposition: string | null) => {
	if (!contentDisposition) {
		return 'payments.xlsx';
	}

	const match = contentDisposition.match(/filename="?([^";]+)"?/i);
	return match?.[1] || 'payments.xlsx';
};

export const useExportInvoices = () => {
	return useMutation({
		mutationFn: async (params: Omit<GetInvoicesQueryParams, 'page' | 'limit'>) => {
			const queryParams = new URLSearchParams({
				year: params.year?.toString() || '',
				month: params.month?.toString() || '',
				programId: params.programId || '',
				paymentStatus: params.paymentStatus || '',
				payMethod: params.payMethod || '',
				familyId: params.familyId || '',
				keyword: params.keyword || '',
			});

			const response = await fetchAuth(`/api/invoices/export?${queryParams.toString()}`);
			const blob = await response.blob();
			const fileName = getFileNameFromHeader(response.headers.get('content-disposition'));

			const url = window.URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = fileName;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			window.URL.revokeObjectURL(url);
		},
	});
};
