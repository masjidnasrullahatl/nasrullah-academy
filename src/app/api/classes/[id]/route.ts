import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { UpdateClassSchema } from '../types';

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const data = UpdateClassSchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.classes.findUnique({ where: { id } });

		if (!existing) return notFound('Class not found');

		const nextName = data.name || existing.name;
		const nextProgramId = data.programId || existing.programId;

		if (nextName !== existing.name || nextProgramId !== existing.programId) {
			const duplicateClass = await prisma.classes.findFirst({
				where: {
					name: nextName,
					programId: nextProgramId,
					NOT: { id },
				},
			});

			if (duplicateClass) return badRequest('Class already exists');
		}

		const classItem = await prisma.classes.update({
			where: { id },
			data: {
				name: nextName,
				programId: nextProgramId,
				teacherId: data.teacherId || null,
				status: data.status || existing.status,
			},
			include: {
				teacher: true,
				program: true,
				enrollments: {
					where: { status: 'ACTIVE' },
					include: { student: { include: { family: true } } },
				},
			},
		});

		return success(classItem);
	} catch (error) {
		console.log('Update class error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

const remove = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const classItem = await prisma.classes.findUnique({
		where: { id },
		include: {
			_count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
		},
	});

	if (!classItem) return notFound('Class not found');

	if (classItem._count.enrollments > 0) {
		return badRequest('Cannot delete class with active enrollments');
	}

	await prisma.classes.delete({ where: { id } });

	return success(classItem);
};

export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
