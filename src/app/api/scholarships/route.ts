import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { internalServerError, success } from '../utils/response';

import { ScholarshipSchema } from './types';
import {
	mapScholarship,
	scholarshipInclude,
	toScholarshipData,
} from './utils';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const familyId = searchParams.get('familyId') || '';

	const prisma = createClient();

	const where: Prisma.ScholarshipsWhereInput = {};

	if (familyId) where.student = { familyId };

	if (keyword) {
		where.OR = [
			{ donorName: { contains: keyword, mode: 'insensitive' } },
			{ student: { firstName: { contains: keyword, mode: 'insensitive' } } },
			{ student: { lastName: { contains: keyword, mode: 'insensitive' } } },
			{
				student: {
					family: { name: { contains: keyword, mode: 'insensitive' } },
				},
			},
		];
	}

	const [scholarships, total] = await Promise.all([
		prisma.scholarships.findMany({
			skip: (page - 1) * limit,
			take: limit,
			orderBy: [{ startMonth: 'desc' }, { createdAt: 'desc' }],
			where,
			include: scholarshipInclude,
		}),
		prisma.scholarships.count({ where }),
	]);

	return NextResponse.json({
		data: scholarships.map(mapScholarship),
		total,
		error: null,
	});
};

const create = async (request: AuthRequest) => {
	try {
		const payload = ScholarshipSchema.parse(await request.json());

		const scholarship = await createClient().scholarships.create({
			data: toScholarshipData(payload),
			include: scholarshipInclude,
		});

		return success(mapScholarship(scholarship));
	} catch (error) {
		console.log('Create scholarship error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
