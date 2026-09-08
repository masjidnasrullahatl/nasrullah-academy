import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { badRequest, internalServerError, success } from '../utils/response';

import { CreateTeacherSchema } from './types';
import { inviteTeacherAccount } from './utils';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const status = searchParams.get('status') || '';

	const prisma = createClient();

	const skip = (page - 1) * limit;

	const where: Prisma.TeachersWhereInput = {};

	if (keyword) {
		where.OR = [
			{ firstName: { contains: keyword, mode: 'insensitive' } },
			{ lastName: { contains: keyword, mode: 'insensitive' } },
			{ phoneNumber: { contains: keyword, mode: 'insensitive' } },
			{ email: { contains: keyword, mode: 'insensitive' } },
		];
	}

	if (status) where.status = status as any;

	const total = await prisma.teachers.count({ where });

	const teachers = await prisma.teachers.findMany({
		where,
		skip,
		take: limit,
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
		include: { classes: true, _count: { select: { classes: true } } },
	});

	const data = teachers.map((teacher) => ({
		...teacher,
		hourlyRate: teacher.hourlyRate === null ? null : Number(teacher.hourlyRate),
		hasAccount: Boolean(teacher.supabaseUserId),
	}));

	return NextResponse.json({ data, total, error: null });
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = CreateTeacherSchema.parse(body);

		const prisma = createClient();

		const duplicated = await prisma.teachers.findFirst({
			where: { email: { equals: data.email, mode: 'insensitive' } },
		});

		if (duplicated) return badRequest('Teacher email already exists');

		const teacher = await prisma.teachers.create({
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber || null,
				email: data.email,
				hourlyRate: data.hourlyRate ?? null,
				status: data.status,
			},
		});

		const invite = await inviteTeacherAccount(teacher);
		const inviteError = 'error' in invite ? invite.error : null;

		return success({
			...teacher,
			hourlyRate:
				teacher.hourlyRate === null ? null : Number(teacher.hourlyRate),
			hasAccount: !inviteError,
			inviteError,
		});
	} catch (error) {
		console.log('Create teacher error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
