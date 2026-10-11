import type { User } from '@supabase/supabase-js';

import { createClient } from '@helpers/prisma/server';
import { getAppRole } from '@helpers/supabase/role';

/**
 * The teacher record for the signed-in login. If the record is linked to a
 * login that no longer exists, a teacher login with the same email is
 * linked to it instead.
 */
export async function getCurrentTeacher(
	user: Pick<User, 'id' | 'email' | 'app_metadata'>,
) {
	const prisma = createClient();

	const teacher = await prisma.teachers.findUnique({
		where: { supabaseUserId: user.id },
	});

	if (teacher || !user.email || getAppRole(user) !== 'teacher') return teacher;

	const byEmail = await prisma.teachers.findFirst({
		where: { email: { equals: user.email.trim(), mode: 'insensitive' } },
	});

	if (!byEmail) return null;

	return prisma.teachers.update({
		where: { id: byEmail.id },
		data: { supabaseUserId: user.id },
	});
}
