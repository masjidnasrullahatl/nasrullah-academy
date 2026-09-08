import filter from 'lodash/filter';
import keyBy from 'lodash/keyBy';
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

import { UpdateFamilySchema } from '../types';

const getDetail = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const family = await prisma.families.findUnique({
		where: { id },
		include: {
			students: {
				include: {
					enrollments: { include: { class: { include: { teacher: true } } } },
				},
				orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
			},
		},
	});

	if (!family) return notFound('Family not found');

	return success(family);
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
			include: { students: true },
		});

		if (!existingFamily) return notFound('Family not found');

		await prisma.$transaction(async (tx) => {
			await tx.families.update({
				where: { id },
				data: {
					email: payload.email || null,
					name: payload.name,
					status: payload.status,
					fatherName: payload.fatherName || null,
					motherName: payload.motherName || null,
					primaryPhone: payload.primaryPhone,
					secondaryPhone: payload.secondaryPhone || null,
					address: payload.address || null,
					notes: payload.notes || null,
				},
			});

			const payloadById = keyBy(filter(payload.students, 'id'), 'id');

			for (const student of existingFamily.students) {
				const incoming = payloadById[student.id];

				if (!incoming) {
					await tx.students.delete({ where: { id: student.id } });
					continue;
				}

				const { dateOfBirth, ...studentData } = incoming;

				await tx.students.update({
					where: { id: student.id },
					data: {
						firstName: studentData.firstName,
						lastName: studentData.lastName,
						gender: studentData.gender,
						dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
						status: studentData.status,
						notes: studentData.notes || null,
					},
				});
			}

			for (const student of payload.students) {
				if (student.id) continue;

				const dOB = student.dateOfBirth ? new Date(student.dateOfBirth) : null;

				await tx.students.create({
					data: {
						familyId: id,
						firstName: student.firstName,
						lastName: student.lastName,
						gender: student.gender,
						dateOfBirth: dOB,
						status: student.status,
						notes: student.notes || null,
					},
				});
			}
		});

		const family = await prisma.families.findUnique({
			where: { id },
			include: { students: true },
		});

		return success(family);
	} catch (error) {
		console.log('Update family error', error);

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

	const family = await prisma.families.findUnique({ where: { id } });

	if (!family) return notFound('Family not found');

	await prisma.families.delete({ where: { id } });

	return success(family);
};

export const GET = withStaff(getDetail);
export const PUT = withStaff(update);
export const DELETE = withStaff(remove);
