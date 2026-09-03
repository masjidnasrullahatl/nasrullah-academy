import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { badRequest, internalServerError, success } from '../utils/response';

import { CreateClassSchema } from './types';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const teacherId = searchParams.get('teacherId') || '';
	const programId = searchParams.get('programId') || '';
	const status = searchParams.get('status') || '';

	const prisma = createClient();
	const skip = (page - 1) * limit;

	const where: Prisma.ClassesWhereInput = {};

	if (keyword) where.name = { contains: keyword, mode: 'insensitive' };
	if (teacherId) where.teacherId = teacherId;
	if (programId) where.programId = programId;
	if (status) where.status = status as any;

	const total = await prisma.classes.count({ where });

	const classes = await prisma.classes.findMany({
		skip,
		take: limit,
		orderBy: { name: 'asc' },
		include: {
			teacher: true,
			program: true,
			enrollments: {
				where: { status: 'ACTIVE' },
				include: { student: { include: { family: true } } },
			},
		},
		where,
	});

	const data = classes.map((item) => {
		const activeStudents = item.enrollments.map(
			(enrollment) => enrollment.student,
		);
		return {
			...item,
			studentCount: activeStudents.length,
			boysCount: activeStudents.filter((student) => student.gender === 'BOY')
				.length,
			girlsCount: activeStudents.filter((student) => student.gender === 'GIRL')
				.length,
		};
	});

	return NextResponse.json({ data, total, error: null });
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = CreateClassSchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.classes.findFirst({
			where: {
				name: data.name,
				programId: data.programId,
			},
		});

		if (existing) return badRequest('Class already exists');

		const classItem = await prisma.classes.create({
			data: {
				name: data.name,
				programId: data.programId,
				teacherId: data.teacherId || null,
				status: data.status,
			},
			include: {
				teacher: true,
				program: true,
				enrollments: {
					where: { status: 'ACTIVE' },
					include: { student: { include: { family: true } } },
				},
			},
		});

		return success(classItem);
	} catch (error) {
		console.log('Create class error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withAuth(getPaging);
export const POST = withAuth(create);
