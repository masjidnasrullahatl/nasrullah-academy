import { PagingQueryParams } from '@app/api/types/common';

export type GetPayRecordsQueryParams = PagingQueryParams & {
	payPeriodId?: string;
	teacherId?: string;
};
