import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

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

		const changedUniqueFields =
			existing.name !== data.name ||
			existing.programId !== data.programId ||
			existing.schoolYear !== data.schoolYear;

		if (changedUniqueFields) {
			const duplicateClass = await prisma.classes.findUnique({
				where: {
					name_programId_schoolYear: {
						name: data.name,
						programId: data.programId,
						schoolYear: data.schoolYear,
					},
				},
			});

			if (duplicateClass) {
				return badRequest(
					'Class already exists for this program and school year',
				);
			}
		}

		const classItem = await prisma.classes.update({
			where: { id },
			data: {
				name: data.name,
				programId: data.programId,
				teacherId: data.teacherId || null,
				session: data.session,
				room: data.room || null,
				schoolYear: data.schoolYear,
				capacity: data.capacity || null,
				status: data.status,
			},
			include: {
				program: true,
				teacher: true,
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
		return badRequest(
			'Cannot delete class with active enrollments. Move or withdraw students first.',
		);
	}

	await prisma.classes.delete({ where: { id } });

	return success(classItem);
};

export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
