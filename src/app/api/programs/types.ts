import { ArchiveStatus } from '@prisma/client';

import { PagingQueryParams } from '@app/api/types/common';

export type GetProgramsQueryParams = PagingQueryParams & {
	keyword?: string;
	status?: ArchiveStatus;
};
