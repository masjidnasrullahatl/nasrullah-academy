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

import { AssignStudentsSchema } from './types';

const assignStudents = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id: classId } = await params;
		const body = await request.json();
		const data = AssignStudentsSchema.parse(body);

		const prisma = createClient();

		const classItem = await prisma.classes.findUnique({
			where: { id: classId },
		});

		if (!classItem) return notFound('Class not found');

		let createdCount = 0;

		for (const studentId of data.studentIds) {
			const existing = await prisma.enrollments.findUnique({
				where: { studentId_classId: { studentId, classId } },
			});

			if (existing?.status === 'ACTIVE') continue;

			if (existing) {
				await prisma.enrollments.update({
					where: { id: existing.id },
					data: {
						status: 'ACTIVE',
						startDate: new Date(),
						endDate: null,
						programId: classItem.programId,
					},
				});
				createdCount += 1;
				continue;
			}

			await prisma.enrollments.create({
				data: {
					studentId,
					classId,
					programId: classItem.programId,
					status: 'ACTIVE',
					startDate: new Date(),
				},
			});

			createdCount += 1;
		}

		return success({ createdCount });
	} catch (error) {
		console.log('Assign students to class error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError('Internal server error');
	}
};

const removeStudent = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id: classId } = await params;
	const { searchParams } = new URL(request.url);

	const studentId = searchParams.get('studentId');

	if (!studentId) return badRequest('studentId is required');

	const prisma = createClient();

	const enrollment = await prisma.enrollments.findUnique({
		where: { studentId_classId: { studentId, classId } },
	});

	if (!enrollment || enrollment.status !== 'ACTIVE') {
		return notFound('Active enrollment not found');
	}

	const updated = await prisma.enrollments.update({
		where: { id: enrollment.id },
		data: { status: 'WITHDRAWN', endDate: new Date() },
	});

	return success(updated);
};

const getAvailableStudents = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id: classId } = await params;
	const { searchParams } = new URL(request.url);

	const keyword = searchParams.get('keyword') || '';
	const programId = searchParams.get('programId') || '';

	const prisma = createClient();

	const activeEnrollments = await prisma.enrollments.findMany({
		where: { classId, status: 'ACTIVE' },
		select: { studentId: true },
	});

	const excludedIds = activeEnrollments.map((item) => item.studentId);

	const students = await prisma.students.findMany({
		where: {
			status: 'ACTIVE',
			...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
			...(keyword
				? {
						OR: [
							{ firstName: { contains: keyword, mode: 'insensitive' } },
							{ lastName: { contains: keyword, mode: 'insensitive' } },
							{ family: { name: { contains: keyword, mode: 'insensitive' } } },
						],
					}
				: {}),
			...(programId
				? { enrollments: { some: { programId, status: 'ACTIVE' } } }
				: {}),
		},
		include: { family: true },
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
	});

	return success(students);
};

export const POST = withAuth(assignStudents);
export const DELETE = withAuth(removeStudent);
export const GET = withAuth(getAvailableStudents);
