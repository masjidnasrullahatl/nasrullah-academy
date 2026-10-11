import { Teachers } from '@prisma/client';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';

import { createClient } from '@helpers/prisma/server';
import { createAdminClient } from '@helpers/supabase/admin';

type InviteResult = { supabaseUserId: string } | { error: string };

/** The login with this email, if one exists. */
export const findAuthUserByEmail = async (email: string) => {
	const adminClient = createAdminClient();
	const target = email.trim().toLowerCase();

	for (let page = 1; page <= 20; page++) {
		const { data, error } = await adminClient.auth.admin.listUsers({
			page,
			perPage: 200,
		});

		if (error) return null;

		const match = data.users.find(
			(user) => user.email?.toLowerCase() === target,
		);

		if (match) return match;
		if (data.users.length < 200) return null;
	}

	return null;
};

/**
 * Makes sure the teacher record points at a login that still exists:
 * relinks to the login with the teacher's email, or clears the link so a
 * fresh invite can be sent. Returns the linked login id, or null.
 */
export const repairTeacherLink = async (
	teacher: Pick<Teachers, 'id' | 'email' | 'supabaseUserId'>,
) => {
	const adminClient = createAdminClient();
	const prisma = createClient();

	if (teacher.supabaseUserId) {
		const { data } = await adminClient.auth.admin.getUserById(
			teacher.supabaseUserId,
		);

		if (data?.user) return teacher.supabaseUserId;
	}

	const existing = teacher.email
		? await findAuthUserByEmail(teacher.email)
		: null;

	const supabaseUserId = existing?.id || null;

	if (supabaseUserId !== teacher.supabaseUserId) {
		await prisma.teachers.update({
			where: { id: teacher.id },
			data: { supabaseUserId },
		});
	}

	return supabaseUserId;
};

/**
 * Marks an existing login as a teacher unless it's already staff, so a
 * teacher account can never end up without a role.
 */
export const ensureTeacherRole = async (supabaseUserId: string) => {
	const adminClient = createAdminClient();

	const { data, error } =
		await adminClient.auth.admin.getUserById(supabaseUserId);

	if (error || !data.user) return;

	const role = data.user.app_metadata?.role;

	if (role === 'teacher' || role === 'staff') return;

	await adminClient.auth.admin.updateUserById(supabaseUserId, {
		app_metadata: { role: 'teacher' },
	});
};

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
