import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 100);
	const keyword = searchParams.get('keyword') || '';
	const programId = searchParams.get('programId') || '';

	const prisma = createClient();

	const skip = (page - 1) * limit;

	const where: Prisma.ClassesWhereInput = {};
	if (keyword) {
		where.name = { contains: keyword, mode: 'insensitive' };
	}
	if (programId) {
		where.programId = programId;
	}

	const total = await prisma.classes.count({ where });

	const data = await prisma.classes.findMany({
		skip,
		take: limit,
		where,
		orderBy: {
			name: 'asc',
		},
		include: {
			program: true,
		},
	});

	return NextResponse.json({ data, total, error: null });
};

export const GET = withAuth(getPaging);
