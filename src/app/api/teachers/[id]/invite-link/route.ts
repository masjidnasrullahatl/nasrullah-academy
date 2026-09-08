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

import { inviteTeacherAccount } from '../../utils';

const getInviteLink = async (
	_: AuthRequest,
	{ params }: ParamsRequest<{ id: string }>,
) => {
	try {
		const { id } = await params;
		const prisma = createClient();
		const adminClient = createAdminClient();

		const teacher = await prisma.teachers.findUnique({ where: { id } });

		if (!teacher) return notFound('Teacher not found');
		if (!teacher.email) return badRequest('Teacher email is required');

		// Chưa có tài khoản → tạo trước (helper S26, đã có rollback)
		if (!teacher.supabaseUserId) {
			const invite = await inviteTeacherAccount(teacher);

			if ('error' in invite) return badRequest(invite.error);
		}

		// generateLink KHÔNG gửi email, chỉ sinh token. Lấy hashed_token rồi tự dựng link
		// trỏ về /auth/confirm — route đó đổi token lấy phiên phía server (verifyOtp), tránh
		// hoàn toàn hash fragment + PKCE của client. type 'recovery' chứ không phải 'invite':
		// 'invite' sẽ tạo user mới nếu email chưa tồn tại → user không có app_metadata.role
		// → bị coi là staff (lỗ hổng S22/S23); và với user đã tồn tại 'invite' còn trả 422.
		const { data, error } = await adminClient.auth.admin.generateLink({
			type: 'recovery',
			email: teacher.email,
		});

		if (error || !data.properties?.hashed_token) {
			return badRequest(error?.message || 'Unable to generate invite link');
		}

		const link = `${NEXT_PUBLIC_SITE_URL}/auth/confirm?token_hash=${
			data.properties.hashed_token
		}&type=recovery&next=${encodeURIComponent('/auth/password-reset/confirm')}`;

		return success({ link });
	} catch (error) {
		console.log('Generate invite link error', error);
		return internalServerError();
	}
};

export const POST = withStaff(getInviteLink);
