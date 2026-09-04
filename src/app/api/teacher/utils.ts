import { createClient } from '@helpers/prisma/server';

export async function getCurrentTeacher(userId: string) {
	const prisma = createClient();

	return prisma.teachers.findUnique({
		where: { supabaseUserId: userId },
	});
}
