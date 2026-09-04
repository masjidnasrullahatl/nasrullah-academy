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

const resendTeacherInvite = async (
	request: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const prisma = createClient();
		const adminClient = createAdminClient();

		const teacher = await prisma.teachers.findUnique({ where: { id } });

		if (!teacher) {
			return notFound('Teacher not found');
		}

		if (!teacher.email) {
			return badRequest('Teacher email is required to resend invite');
		}

		if (!teacher.supabaseUserId) {
			return badRequest('Teacher account has not been created yet');
		}

		const { error } = await adminClient.auth.admin.generateLink({
			type: 'invite',
			email: teacher.email,
		});

		if (error) {
			return badRequest(error.message);
		}

		return success(teacher);
	} catch (error) {
		console.log('Resend teacher invite error', error);
		return internalServerError();
	}
};

export const POST = withStaff(resendTeacherInvite);
