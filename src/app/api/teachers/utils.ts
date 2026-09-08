import { Teachers } from '@prisma/client';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';

import { createClient } from '@helpers/prisma/server';
import { createAdminClient } from '@helpers/supabase/admin';

type InviteResult = { supabaseUserId: string } | { error: string };

export const inviteTeacherAccount = async (
	teacher: Pick<Teachers, 'id' | 'email' | 'firstName' | 'lastName'>,
): Promise<InviteResult> => {
	if (!teacher.email) return { error: 'Teacher email is required' };

	const adminClient = createAdminClient();
	const prisma = createClient();

	const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
		teacher.email,
		{
			redirectTo: `${NEXT_PUBLIC_SITE_URL}/auth/password-reset/confirm`,
			data: { full_name: `${teacher.firstName} ${teacher.lastName}` },
		},
	);

	if (error || !data.user) {
		return { error: error?.message || 'Unable to send teacher invite' };
	}

	const invitedUserId = data.user.id;

	try {
		// inviteUserByEmail không set được app_metadata → set riêng
		const { error: roleError } = await adminClient.auth.admin.updateUserById(
			invitedUserId,
			{ app_metadata: { role: 'teacher' } },
		);

		if (roleError) throw new Error(roleError.message);

		await prisma.teachers.update({
			where: { id: teacher.id },
			data: { supabaseUserId: invitedUserId },
		});

		return { supabaseUserId: invitedUserId };
	} catch (stepError) {
		const { error: deleteError } =
			await adminClient.auth.admin.deleteUser(invitedUserId);

		if (deleteError) {
			console.log('Rollback invited user failed', invitedUserId, deleteError);
		}

		return {
			error:
				stepError instanceof Error
					? stepError.message
					: 'Unable to complete teacher invite',
		};
	}
};
