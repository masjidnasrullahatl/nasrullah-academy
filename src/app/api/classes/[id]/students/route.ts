import { EnrollmentStatus } from '@prisma/client';
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
				const payload = {
					startDate: new Date(),
					endDate: null,
					status: EnrollmentStatus.ACTIVE,
				};

				await prisma.enrollments.update({
					data: payload,
					where: { id: existing.id },
				});

				createdCount += 1;
				continue;
			}

			const payload = {
				classId,
				studentId,
				status: EnrollmentStatus.ACTIVE,
				startDate: new Date(),
			};

			await prisma.enrollments.create({ data: payload });

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

	if (!enrollment) return notFound('Enrollment not found');

	if (enrollment.status !== EnrollmentStatus.ACTIVE) {
		return badRequest('Student is not active in this class');
	}

	const payload = {
		status: EnrollmentStatus.WITHDRAWN,
		endDate: new Date(),
	};

	await prisma.enrollments.update({
		where: { id: enrollment.id },
		data: payload,
	});

	return success({ id: enrollment.id });
};

const getAvailableStudents = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id: classId } = await params;
	const { searchParams } = new URL(request.url);

	const keyword = searchParams.get('keyword') || '';

	const prisma = createClient();

	const classItem = await prisma.classes.findUnique({
		where: { id: classId },
	});

	if (!classItem) return notFound('Class not found');

	const students = await prisma.students.findMany({
		where: {
			status: 'ACTIVE',
			family: { status: 'ACTIVE' },
			...(keyword
				? {
						OR: [
							{ firstName: { contains: keyword, mode: 'insensitive' } },
							{ lastName: { contains: keyword, mode: 'insensitive' } },
							{ family: { name: { contains: keyword, mode: 'insensitive' } } },
						],
					}
				: {}),
			enrollments: { none: { classId, status: EnrollmentStatus.ACTIVE } },
		},
		include: { family: true },
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
		take: 500,
	});

	return success(students);
};

export const POST = withStaff(assignStudents);
export const DELETE = withStaff(removeStudent);
export const GET = withStaff(getAvailableStudents);
