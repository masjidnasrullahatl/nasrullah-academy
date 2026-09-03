import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { catchZodError } from '../utils/catchZodError';
import { badRequest, internalServerError, success } from '../utils/response';

import { CreateProgramSchema } from './types';

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
		where.name = { contains: keyword, mode: 'insensitive' };
	}

	if (status) {
		where.status = status as any;
	}

	const [data, total] = await Promise.all([
		prisma.programs.findMany({
			skip,
			take: limit,
			orderBy: { name: 'asc' },
			where,
			include: {
				_count: { select: { classes: true, invoices: true } },
			},
		}),
		prisma.programs.count({ where }),
	]);

	return NextResponse.json({ data, total, error: null });
};

const create = async (request: AuthRequest) => {
	try {
		const body = await request.json();
		const data = CreateProgramSchema.parse(body);

		const prisma = createClient();

		const existingProgram = await prisma.programs.findFirst({
			where: {
				name: {
					equals: data.name,
					mode: 'insensitive',
				},
			},
		});

		if (existingProgram) {
			return badRequest('Program name already exists');
		}

		const program = await prisma.programs.create({
			data: {
				name: data.name,
				description: data.description || null,
				status: data.status || 'ACTIVE',
			},
			include: {
				_count: { select: { classes: true, invoices: true } },
			},
		});

		return success(program);
	} catch (error) {
		console.log('Create program error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

export const GET = withAuth(getPaging);
export const POST = withAuth(create);
