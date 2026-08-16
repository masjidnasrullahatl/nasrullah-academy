import { NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdateClassSchema } from '../types';

const getDetail = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const classItem = await prisma.classes.findUnique({
		where: { id },
		include: {
			program: true,
			teacher: true,
			enrollments: {
				where: { status: 'ACTIVE' },
				include: {
					student: {
						include: {
							family: true,
						},
					},
					program: true,
					class: {
						include: {
							teacher: true,
						},
					},
				},
			},
		},
	});

	if (!classItem) {
		return NextResponse.json({ error: 'Class not found' }, { status: 404 });
	}

	return NextResponse.json({ data: classItem, error: null });
};

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
		if (!existing) {
			return NextResponse.json({ error: 'Class not found' }, { status: 404 });
		}

		if (
			(existing.name !== data.name ||
				existing.programId !== data.programId ||
				existing.schoolYear !== data.schoolYear) &&
			(await prisma.classes.findUnique({
				where: {
					name_programId_schoolYear: {
						name: data.name,
						programId: data.programId,
						schoolYear: data.schoolYear,
					},
				},
			}))
		) {
			return NextResponse.json(
				{ error: 'Class already exists for this program and school year', data: null },
				{ status: 409 },
			);
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
					include: {
						student: {
							include: {
								family: true,
							},
						},
					},
				},
			},
		});

		return NextResponse.json({ data: classItem, error: null });
	} catch (error) {
		console.log('Update class error', error);

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

	const classItem = await prisma.classes.findUnique({
		where: { id },
		include: {
			_count: {
				select: {
					enrollments: {
						where: { status: 'ACTIVE' },
					},
				},
			},
		},
	});

	if (!classItem) {
		return NextResponse.json({ error: 'Class not found' }, { status: 404 });
	}

	if (classItem._count.enrollments > 0) {
		return NextResponse.json(
			{
				error:
					'Cannot delete class with active enrollments. Move or withdraw students first.',
				data: null,
			},
			{ status: 400 },
		);
	}

	await prisma.classes.delete({ where: { id } });

	return NextResponse.json({ data: classItem, error: null });
};

export const GET = withAuth(getDetail);
export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
