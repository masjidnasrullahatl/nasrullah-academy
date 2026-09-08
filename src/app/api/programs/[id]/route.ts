import { ZodError } from 'zod/v4';

import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';

import { UpdateProgramSchema } from '../types';

const getDetail = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;

	const prisma = createClient();

	const program = await prisma.programs.findUnique({
		where: { id },
		include: { _count: { select: { classes: true, invoices: true } } },
	});

	if (!program) return notFound('Program not found');

	return success(program);
};

const update = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const body = await request.json();

		const data = UpdateProgramSchema.parse(body);

		const prisma = createClient();

		let program = await prisma.programs.findUnique({ where: { id } });

		if (!program) return notFound('Program not found');

		if (data.name && data.name !== program.name) {
			const duplicateProgram = await prisma.programs.findFirst({
				where: {
					NOT: { id },
					name: { equals: data.name, mode: 'insensitive' },
				},
			});

			if (duplicateProgram) return badRequest('Program name already exists');
		}

		program = await prisma.programs.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description ?? null,
				status: data.status,
			},
			include: { _count: { select: { classes: true, invoices: true } } },
		});

		return success(program);
	} catch (error) {
		console.log('Update program error', error);

		if (error instanceof ZodError) return catchZodError(error);

		return internalServerError();
	}
};

const remove = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	const { id } = await params;
	const prisma = createClient();

	const program = await prisma.programs.findUnique({
		where: { id },
		include: {
			_count: { select: { classes: true, invoices: true } },
		},
	});

	if (!program) return notFound('Program not found');

	if (program._count.classes > 0 || program._count.invoices > 0) {
		return badRequest(
			'Cannot delete program with existing classes or invoices',
		);
	}

	await prisma.programs.delete({ where: { id } });

	return success(program);
};

export const GET = withStaff(getDetail);
export const PATCH = withStaff(update);
export const DELETE = withStaff(remove);
