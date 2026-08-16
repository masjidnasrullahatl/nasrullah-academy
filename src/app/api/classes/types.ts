import { ArchiveStatus, ClassSession } from '@prisma/client';
import z from 'zod/v4';

import { PagingQueryParams } from '@app/api/types/common';

export type GetClassesQueryParams = PagingQueryParams & {
	keyword?: string;
	programId?: string;
	teacherId?: string;
	schoolYear?: number;
	session?: ClassSession;
	status?: ArchiveStatus;
};

export const CreateClassSchema = z.object({
	name: z.string().min(1, 'Class name is required'),
	programId: z.string().min(1, 'Program is required'),
	teacherId: z.string().optional().nullable(),
	session: z.enum(['AM', 'PM', 'AM_PM', 'NA']).default('NA'),
	room: z.string().optional().nullable(),
	schoolYear: z.number().int().min(2000).max(2100),
	capacity: z.number().int().min(0).optional().nullable(),
	status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const UpdateClassSchema = CreateClassSchema;

export const AssignStudentsSchema = z.object({
	studentIds: z.array(z.string()).min(1, 'Select at least one student'),
});

export type CreateClassPayload = z.infer<typeof CreateClassSchema>;
export type UpdateClassPayload = z.infer<typeof UpdateClassSchema>;
export type AssignStudentsPayload = z.infer<typeof AssignStudentsSchema>;
