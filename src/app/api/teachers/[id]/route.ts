import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { UpdateTeacherSchema } from '../types';

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;

		const body = await request.json();
		const data = UpdateTeacherSchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.teachers.findUnique({ where: { id } });

		if (!existing) return notFound('Teacher not found');

		const teacher = await prisma.teachers.update({
			where: { id },
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber || null,
				email: data.email || null,
				hourlyRate: data.hourlyRate ?? null,
				status: data.status,
			},
		});

		return success({
			...teacher,
			hourlyRate:
				teacher.hourlyRate === null ? null : Number(teacher.hourlyRate),
			hasAccount: Boolean(teacher.supabaseUserId),
		});
	} catch (error) {
		console.log('Update teacher error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

const remove = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const teacher = await prisma.teachers.findUnique({
		where: { id },
		include: { _count: { select: { classes: true } } },
	});

	if (!teacher) return notFound('Teacher not found');

	if (teacher._count.classes > 0) {
		await prisma.classes.updateMany({
			where: { teacherId: id },
			data: { teacherId: null },
		});
	}

	await prisma.teachers.delete({ where: { id } });

	return success({
		...teacher,
		hourlyRate: teacher.hourlyRate === null ? null : Number(teacher.hourlyRate),
		hasAccount: Boolean(teacher.supabaseUserId),
	});
};

export const PUT = withStaff(update);
export const DELETE = withStaff(remove);
