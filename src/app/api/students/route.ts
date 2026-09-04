import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { internalServerError, success } from '../utils/response';

import { CreateStudentSchema } from './types';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const familyId = searchParams.get('familyId') || '';
	const classId = searchParams.get('classId') || '';
	const gender = searchParams.get('gender') || '';
	const status = searchParams.get('status') || '';

	const prisma = createClient();

	const skip = (page - 1) * limit;

	const where: Prisma.StudentsWhereInput = {};
	const enrollmentFilter: Prisma.EnrollmentsWhereInput = {};

	if (keyword) {
		where.OR = [
			{ firstName: { contains: keyword, mode: 'insensitive' } },
			{ lastName: { contains: keyword, mode: 'insensitive' } },
			{ family: { name: { contains: keyword, mode: 'insensitive' } } },
		];
	}

	if (familyId) where.familyId = familyId;

	if (gender) where.gender = gender as any;

	if (status) where.status = status as any;

	if (classId) enrollmentFilter.classId = classId;

	if (classId) {
		where.enrollments = { some: enrollmentFilter };
	}

	const total = await prisma.students.count({ where });

	const students = await prisma.students.findMany({
		skip,
		take: limit,
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
		include: {
			family: true,
			enrollments: { include: { class: true } },
		},
		where,
	});

	return NextResponse.json({
		data: students,
		total,
		error: null,
	});
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const payload = CreateStudentSchema.parse(body);

		const prisma = createClient();

		const student = await prisma.students.create({
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
				enrollments: { include: { class: true } },
			},
		});

		return success(student);
	} catch (error) {
		console.log('Create student error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
