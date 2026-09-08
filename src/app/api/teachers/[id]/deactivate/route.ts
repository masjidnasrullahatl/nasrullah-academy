import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { createClient } from '@helpers/prisma/server';
import { createAdminClient } from '@helpers/supabase/admin';

const deactivateTeacher = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;

		const prisma = createClient();
		const adminClient = createAdminClient();

		const teacher = await prisma.teachers.findUnique({ where: { id } });

		if (!teacher) return notFound('Teacher not found');

		if (!teacher.supabaseUserId) {
			return badRequest('Teacher account has not been created yet');
		}

		const { error } = await adminClient.auth.admin.updateUserById(
			teacher.supabaseUserId,
			{ ban_duration: '876000h' /* 100 years */ },
		);

		if (error) return badRequest(error.message);

		const updatedTeacher = await prisma.teachers.update({
			where: { id },
			data: { status: 'INACTIVE' },
		});

		return success(updatedTeacher);
	} catch (error) {
		console.log('Deactivate teacher account error', error);
		return internalServerError();
	}
};

export const PATCH = withStaff(deactivateTeacher);
