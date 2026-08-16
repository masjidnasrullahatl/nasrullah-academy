import { NextResponse } from 'next/server';

import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';

import { UpdateProgramSchema } from '../types';

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();
		const data = UpdateProgramSchema.parse(body);

		const prisma = createClient();

		const existing = await prisma.programs.findUnique({ where: { id } });
		if (!existing) {
			return NextResponse.json({ error: 'Program not found' }, { status: 404 });
		}

		const program = await prisma.programs.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description || null,
				status: data.status,
			},
		});

		return NextResponse.json({ data: program, error: null });
	} catch (error) {
		console.log('Update program error', error);

		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

const remove = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const program = await prisma.programs.findUnique({
		where: { id },
		include: {
			_count: {
				select: {
					classes: true,
					invoices: true,
				},
			},
		},
	});

	if (!program) {
		return NextResponse.json({ error: 'Program not found' }, { status: 404 });
	}

	if (program._count.classes > 0 || program._count.invoices > 0) {
		return NextResponse.json(
			{
				error:
					'Cannot delete program with linked classes or invoices. Remove them first.',
				data: null,
			},
			{ status: 400 },
		);
	}

	await prisma.programs.delete({ where: { id } });

	return NextResponse.json({ data: program, error: null });
};

export const PUT = withAuth(update);
export const DELETE = withAuth(remove);
