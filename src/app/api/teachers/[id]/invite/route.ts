import { AuthRequest, ParamsRequest } from '@app/api/types/common';
import {
	badRequest,
	internalServerError,
	notFound,
	success,
} from '@app/api/utils/response';
import { withStaff } from '@app/api/utils/withStaff';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';

import { createClient } from '@helpers/prisma/server';
import { createAdminClient } from '@helpers/supabase/admin';

const inviteTeacher = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const prisma = createClient();
		const adminClient = createAdminClient();

		const teacher = await prisma.teachers.findUnique({ where: { id } });

		if (!teacher) return notFound('Teacher not found');

		if (!teacher.email) {
			return badRequest('Teacher email is required to create account');
		}

		if (teacher.supabaseUserId) {
			return badRequest('Teacher account already exists');
		}

		const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
			teacher.email,
			{
				redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/password-reset/confirm`,
				data: { full_name: `${teacher.firstName} ${teacher.lastName}` },
			},
		);

		if (error || !data.user) {
			return badRequest(error?.message || 'Unable to send teacher invite');
		}

		// inviteUserByEmail không set được app_metadata → set riêng
		const { error: roleError } = await adminClient.auth.admin.updateUserById(
			data.user.id,
			{ app_metadata: { role: 'teacher' } },
		);

		if (roleError) return badRequest(roleError.message);

		const updatedTeacher = await prisma.teachers.update({
			where: { id },
			data: { supabaseUserId: data.user.id },
		});

		return success(updatedTeacher);
	} catch (error) {
		console.log('Invite teacher account error', error);
		return internalServerError();
	}
};

export const POST = withStaff(inviteTeacher);
