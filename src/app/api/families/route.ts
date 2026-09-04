import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { internalServerError, success } from '../utils/response';

import { CreateFamilySchema } from './types';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const status = searchParams.get('status') || '';

	const prisma = createClient();

	const skip = (page - 1) * limit;

	const where: Prisma.FamiliesWhereInput = {};

	if (status) where.status = status as any;

	if (keyword) {
		where.OR = [
			{ name: { contains: keyword, mode: 'insensitive' } },
			{ fatherName: { contains: keyword, mode: 'insensitive' } },
			{ motherName: { contains: keyword, mode: 'insensitive' } },
			{ primaryPhone: { contains: keyword, mode: 'insensitive' } },
			{ secondaryPhone: { contains: keyword, mode: 'insensitive' } },
			{ email: { contains: keyword, mode: 'insensitive' } },
		];
	}

	const total = await prisma.families.count({ where });

	const families = await prisma.families.findMany({
		skip,
		take: limit,
		orderBy: { name: 'asc' },
		include: { students: true },
		where,
	});

	const data = families.map((family) => {
		const activeStudents = family.students.filter(
			(student) => student.status === 'ACTIVE',
		);

		return {
			...family,
			studentCount: activeStudents.length,
			boysCount: activeStudents.filter((student) => student.gender === 'BOY')
				.length,
			girlsCount: activeStudents.filter((student) => student.gender === 'GIRL')
				.length,
		};
	});

	return NextResponse.json({
		data,
		total,
		error: null,
	});
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const payload = CreateFamilySchema.parse(body);

		const prisma = createClient();

		const family = await prisma.families.create({
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
				students: {
					create: payload.students.map((student) => ({
						firstName: student.firstName,
						lastName: student.lastName,
						gender: student.gender,
						dateOfBirth: student.dateOfBirth
							? new Date(student.dateOfBirth)
							: null,
						status: student.status,
						notes: student.notes || null,
					})),
				},
			},
			include: { students: true },
		});

		return success(family);
	} catch (error) {
		console.log('Create family error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
