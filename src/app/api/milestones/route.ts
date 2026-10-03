import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { badRequest, internalServerError, success } from '../utils/response';

import { CreateMilestoneSchema } from './types';
import {
	isDuplicateJuzError,
	mapMilestone,
	milestoneInclude,
	toMilestoneData,
} from './utils';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const studentId = searchParams.get('studentId') || '';
	const programId = searchParams.get('programId') || '';
	const type = searchParams.get('type') || '';

	const prisma = createClient();
	const skip = (page - 1) * limit;

	const where: Prisma.MilestonesWhereInput = {};

	if (studentId) where.studentId = studentId;

	if (type) where.type = type as any;

	if (programId) where.student = { programs: { some: { programId } } };

	if (keyword) {
		where.OR = [
			{ bookName: { contains: keyword, mode: 'insensitive' } },
			{ student: { firstName: { contains: keyword, mode: 'insensitive' } } },
			{ student: { lastName: { contains: keyword, mode: 'insensitive' } } },
			{
				student: {
					family: { name: { contains: keyword, mode: 'insensitive' } },
				},
			},
		];
	}

	const [milestones, total] = await Promise.all([
		prisma.milestones.findMany({
			skip,
			take: limit,
			orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
			where,
			include: milestoneInclude,
		}),
		prisma.milestones.count({ where }),
	]);

	return NextResponse.json({
		data: milestones.map(mapMilestone),
		total,
		error: null,
	});
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const payload = CreateMilestoneSchema.parse(body);

		const prisma = createClient();

		const milestone = await prisma.milestones.create({
			data: toMilestoneData(payload),
			include: milestoneInclude,
		});

		return success(mapMilestone(milestone));
	} catch (error) {
		console.log('Create milestone error', error);

		if (error instanceof ZodError) return catchZodError(error);

		if (isDuplicateJuzError(error)) {
			return badRequest('This Juz is already recorded for this student');
		}

		return internalServerError();
	}
};

export const GET = withStaff(getPaging);
export const POST = withStaff(create);
