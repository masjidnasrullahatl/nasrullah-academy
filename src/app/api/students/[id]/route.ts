import { NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { AuthRequest,ParamsRequest  } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdateStudentSchema } from '../types';

const getDetail = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const student = await prisma.students.findUnique({
		where: { id },
		include: {
			family: true,
			enrollments: {
				include: {
					class: {
						include: {
							teacher: true,
						},
					},
					program: true,
				},
			},
		},
	});

	if (!student) {
		return NextResponse.json({ error: 'Student not found' }, { status: 404 });
	}

	return NextResponse.json({ data: student, error: null });
};

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const payload = UpdateStudentSchema.parse(body);

		const prisma = createClient();

		const existingStudent = await prisma.students.findUnique({
			where: { id },
		});

		if (!existingStudent) {
			return NextResponse.json({ error: 'Student not found' }, { status: 404 });
		}

		const student = await prisma.students.update({
			where: { id },
			data: {
				familyId: payload.familyId,
				firstName: payload.firstName,
				lastName: payload.lastName,
				gender: payload.gender,
				dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
				status: payload.status,
				notes: payload.notes || null,
			},
			include: {
				family: true,
				enrollments: {
					include: {
						class: true,
						program: true,
					},
				},
			},
		});

		return NextResponse.json({ data: student, error: null });
	} catch (error) {
		console.log('Update student error', error);

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

	const student = await prisma.students.findUnique({
		where: { id },
	});

	if (!student) {
		return NextResponse.json({ error: 'Student not found' }, { status: 404 });
	}

	await prisma.students.delete({
		where: { id },
	});

	return NextResponse.json({ data: student, error: null });
};

export const GET = withAuth(getDetail);
export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
