import { NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { AssignStudentsSchema } from '../../types';

const assignStudents = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id: classId } = await params;
		const body = await request.json();
		const data = AssignStudentsSchema.parse(body);

		const prisma = createClient();

		const classItem = await prisma.classes.findUnique({ where: { id: classId } });
		if (!classItem) {
			return NextResponse.json({ error: 'Class not found' }, { status: 404 });
		}

		let createdCount = 0;

		for (const studentId of data.studentIds) {
			const existing = await prisma.enrollments.findUnique({
				where: {
					studentId_classId: {
						studentId,
						classId,
					},
				},
			});

			if (existing?.status === 'ACTIVE') {
				continue;
			}

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

		return NextResponse.json({
			data: {
				createdCount,
			},
			error: null,
		});
	} catch (error) {
		console.log('Assign students to class error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

const removeStudent = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id: classId } = await params;
	const { searchParams } = new URL(request.url);

	const studentId = searchParams.get('studentId');
	if (!studentId) {
		return NextResponse.json(
			{ error: 'studentId is required', data: null },
			{ status: 400 },
		);
	}

	const prisma = createClient();

	const enrollment = await prisma.enrollments.findUnique({
		where: {
			studentId_classId: {
				studentId,
				classId,
			},
		},
	});

	if (!enrollment || enrollment.status !== 'ACTIVE') {
		return NextResponse.json(
			{ error: 'Active enrollment not found', data: null },
			{ status: 404 },
		);
	}

	const updated = await prisma.enrollments.update({
		where: { id: enrollment.id },
		data: {
			status: 'WITHDRAWN',
			endDate: new Date(),
		},
	});

	return NextResponse.json({ data: updated, error: null });
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
		where: {
			classId,
			status: 'ACTIVE',
		},
		select: {
			studentId: true,
		},
	});

	const excludedIds = activeEnrollments.map((item) => item.studentId);

	const students = await prisma.students.findMany({
		where: {
			status: 'ACTIVE',
			...(excludedIds.length > 0
				? {
					id: {
						notIn: excludedIds,
					},
				}
				: {}),
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
				? {
					enrollments: {
						some: {
							programId,
							status: 'ACTIVE',
						},
					},
				}
				: {}),
		},
		include: {
			family: true,
		},
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
	});

	return NextResponse.json({ data: students, error: null });
};

export const POST = withAuth(assignStudents);
export const DELETE = withAuth(removeStudent);
export const GET = withAuth(getAvailableStudents);
