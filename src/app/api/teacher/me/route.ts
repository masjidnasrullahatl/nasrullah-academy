import { ZodError } from 'zod/v4';

import { AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import {
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withAuth } from '@app/api/utils/withAuth';

import { createClient } from '@helpers/prisma/server';
import { createAdminClient } from '@helpers/supabase/admin';

import { getCurrentTeacher } from '../utils';

import { UpdateTeacherProfileSchema } from './types';

const getMyProfile = async (request: AuthRequest) => {
	const teacher = await getCurrentTeacher(request.user.id);

	if (!teacher) {
		return notFound('Teacher profile not found');
	}

	return success({
		id: teacher.id,
		email: teacher.email || '',
		firstName: teacher.firstName,
		lastName: teacher.lastName,
		phoneNumber: teacher.phoneNumber || '',
		hourlyRate: teacher.hourlyRate === null ? null : Number(teacher.hourlyRate),
	});
};

const updateMyProfile = async (request: AuthRequest) => {
	try {
		const teacher = await getCurrentTeacher(request.user.id);

		if (!teacher) return notFound('Teacher profile not found');

		const body = await request.json();
		const payload = UpdateTeacherProfileSchema.parse(body);

		const prisma = createClient();

		const updated = await prisma.teachers.update({
			where: { id: teacher.id },
			data: {
				firstName: payload.firstName,
				lastName: payload.lastName,
				phoneNumber: payload.phoneNumber || null,
			},
		});

		const adminClient = createAdminClient();
		await adminClient.auth.admin.updateUserById(request.user.id, {
			user_metadata: {
				full_name: `${payload.firstName} ${payload.lastName}`,
			},
		});

		return success({
			id: updated.id,
			email: updated.email || '',
			firstName: updated.firstName,
			lastName: updated.lastName,
			phoneNumber: updated.phoneNumber || '',
			hourlyRate:
				updated.hourlyRate === null ? null : Number(updated.hourlyRate),
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return internalServerError();
	}
};

export const GET = withAuth(getMyProfile);
export const PATCH = withAuth(updateMyProfile);
