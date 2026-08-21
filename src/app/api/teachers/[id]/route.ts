import { NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

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
		if (!existing) {
			return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
		}

		const teacher = await prisma.teachers.update({
			where: { id },
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber || null,
				email: data.email || null,
				status: data.status,
			},
		});

		return NextResponse.json({ data: teacher, error: null });
	} catch (error) {
		console.log('Update teacher error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

const remove = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const teacher = await prisma.teachers.findUnique({
		where: { id },
		include: {
			_count: {
				select: {
					classes: true,
				},
			},
		},
	});

	if (!teacher) {
		return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
	}

	if (teacher._count.classes > 0) {
		await prisma.classes.updateMany({
			where: { teacherId: id },
			data: { teacherId: null },
		});
	}

	await prisma.teachers.delete({ where: { id } });

	return NextResponse.json({ data: teacher, error: null });
};

export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
