import { NextResponse } from 'next/server';

import { createClient } from '@helpers/prisma/server';

// Programs currently open for online registration (public, no login)
export async function GET() {
	const prisma = createClient();

	const programs = await prisma.programs.findMany({
		where: { status: 'ACTIVE', registrationOpen: true, slug: { not: null } },
		select: { name: true, slug: true },
		orderBy: { name: 'asc' },
	});

	return NextResponse.json({ data: programs, error: null });
}
