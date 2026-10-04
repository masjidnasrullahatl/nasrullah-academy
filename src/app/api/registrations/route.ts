import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { AuthRequest } from '@app/api/types/common';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { mapRegistration, registrationInclude } from './types';

const getPaging = async (request: AuthRequest) => {
	const { searchParams } = new URL(request.url);

	const page = Number(searchParams.get('page') || 1);
	const limit = Number(searchParams.get('limit') || 10);
	const keyword = searchParams.get('keyword') || '';
	const status = searchParams.get('status') || '';
	const programId = searchParams.get('programId') || '';

	const prisma = createClient();
	const skip = (page - 1) * limit;

	const where: Prisma.RegistrationsWhereInput = {};

	if (status) where.status = status as any;

	if (programId) where.programId = programId;

	if (keyword) {
		where.OR = [
			{ parentFirstName: { contains: keyword, mode: 'insensitive' } },
			{ parentLastName: { contains: keyword, mode: 'insensitive' } },
			{ email: { contains: keyword, mode: 'insensitive' } },
			{ phone: { contains: keyword, mode: 'insensitive' } },
		];
	}

	const [registrations, total, pendingCount] = await Promise.all([
		prisma.registrations.findMany({
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			where,
			include: registrationInclude,
		}),
		prisma.registrations.count({ where }),
		prisma.registrations.count({ where: { status: 'PENDING' } }),
	]);

	return NextResponse.json({
		data: registrations.map(mapRegistration),
		total,
		pendingCount,
		error: null,
	});
};

export const GET = withStaff(getPaging);
