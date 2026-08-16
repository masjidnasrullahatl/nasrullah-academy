import { NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { AuthRequest,ParamsRequest  } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdateFamilySchema } from '../types';

const getDetail = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const family = await prisma.families.findUnique({
		where: { id },
		include: {
			students: {
				include: {
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
				orderBy: [
					{
						firstName: 'asc',
					},
					{
						lastName: 'asc',
					},
				],
			},
		},
	});

	if (!family) {
		return NextResponse.json({ error: 'Family not found' }, { status: 404 });
	}

	return NextResponse.json({ data: family, error: null });
};

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const payload = UpdateFamilySchema.parse(body);

		const prisma = createClient();

		const existingFamily = await prisma.families.findUnique({
			where: { id },
			include: {
				students: true,
			},
		});

		if (!existingFamily) {
			return NextResponse.json({ error: 'Family not found' }, { status: 404 });
		}

		await prisma.$transaction(async (tx) => {
			await tx.families.update({
				where: { id },
				data: {
					name: payload.name,
					fatherName: payload.fatherName || null,
					motherName: payload.motherName || null,
					primaryPhone: payload.primaryPhone,
					secondaryPhone: payload.secondaryPhone || null,
					email: payload.email || null,
					address: payload.address || null,
					status: payload.status,
					notes: payload.notes || null,
				},
			});

			const payloadById = new Map(
				payload.students
					.filter((student) => Boolean(student.id))
					.map((student) => [student.id as string, student]),
			);

			for (const student of existingFamily.students) {
				const incoming = payloadById.get(student.id);
				if (!incoming) {
					await tx.students.delete({
						where: { id: student.id },
					});
					continue;
				}

				await tx.students.update({
					where: { id: student.id },
					data: {
						firstName: incoming.firstName,
						lastName: incoming.lastName,
						gender: incoming.gender,
						dateOfBirth: incoming.dateOfBirth
							? new Date(incoming.dateOfBirth)
							: null,
						status: incoming.status,
						notes: incoming.notes || null,
					},
				});
			}

			for (const student of payload.students) {
				if (student.id) {
					continue;
				}

				await tx.students.create({
					data: {
						familyId: id,
						firstName: student.firstName,
						lastName: student.lastName,
						gender: student.gender,
						dateOfBirth: student.dateOfBirth
							? new Date(student.dateOfBirth)
							: null,
						status: student.status,
						notes: student.notes || null,
					},
				});
			}
		});

		const family = await prisma.families.findUnique({
			where: { id },
			include: {
				students: true,
			},
		});

		return NextResponse.json({ data: family, error: null });
	} catch (error) {
		console.log('Update family error', error);

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

	const family = await prisma.families.findUnique({
		where: { id },
	});

	if (!family) {
		return NextResponse.json({ error: 'Family not found' }, { status: 404 });
	}

	await prisma.families.delete({
		where: { id },
	});

	return NextResponse.json({ data: family, error: null });
};

export const GET = withAuth(getDetail);
export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
