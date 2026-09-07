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

const resendTeacherInvite = async (
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
			return badRequest('Teacher email is required to resend invite');
		}

		if (!teacher.supabaseUserId) {
			return badRequest('Teacher account has not been created yet');
		}

		const redirectTo = `${NEXT_PUBLIC_SITE_URL}/auth/password-reset/confirm`;

		const { data: existing, error: getUserError } =
			await adminClient.auth.admin.getUserById(teacher.supabaseUserId);

		if (getUserError || !existing.user) {
			return badRequest(getUserError?.message || 'Teacher account not found');
		}

		const hasAccepted = Boolean(
			existing.user.email_confirmed_at || existing.user.last_sign_in_at,
		);

		if (hasAccepted) {
			const { error } = await adminClient.auth.resetPasswordForEmail(
				teacher.email,
				{ redirectTo },
			);

			if (error) return badRequest(error.message);
		} else {
			const { error } = await adminClient.auth.admin.inviteUserByEmail(
				teacher.email,
				{
					redirectTo,
					data: { full_name: `${teacher.firstName} ${teacher.lastName}` },
				},
			);

			if (error) return badRequest(error.message);
		}

		return success(teacher);
	} catch (error) {
		console.log('Resend teacher invite error', error);
		return internalServerError();
	}
};

export const POST = withStaff(resendTeacherInvite);
