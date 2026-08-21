import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const status = searchParams.get('status') || '';

	const prisma = createClient();

	const skip = (page - 1) * limit;

	const where: Prisma.ProgramsWhereInput = {};

	if (keyword) {
		where.OR = [
			{ name: { contains: keyword, mode: 'insensitive' } },
			{ code: { equals: keyword.toUpperCase() as any } },
		];
	}

	if (status) {
		where.status = status as any;
	}

	const total = await prisma.programs.count({ where });

	const programs = await prisma.programs.findMany({
		skip,
		take: limit,
		orderBy: {
			name: 'asc',
		},
		include: {
			_count: {
				select: {
					classes: true,
					enrollments: true,
				},
			},
		},
		where,
	});

	return NextResponse.json({
		data: programs,
		total,
		error: null,
	});
};

export const GET = withAuth(getPaging);
