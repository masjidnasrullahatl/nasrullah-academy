import { NextRequest, NextResponse } from 'next/server';

import { PublicProgram } from '@app/api/public/registrations/types';

import { createClient } from '@helpers/prisma/server';
import { isStripeEnabled } from '@helpers/stripe';

export async function GET(
	_: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	const prisma = createClient();

	const program = await prisma.programs.findFirst({
		where: { slug, status: 'ACTIVE', registrationOpen: true },
	});

	if (!program) {
		return NextResponse.json(
			{ data: null, error: 'Registration is not open for this program' },
			{ status: 404 },
		);
	}

	const data: PublicProgram = {
		name: program.name,
		slug: slug,
		publicInfo: program.publicInfo,
		registrationFee: Number(program.registrationFee),
		monthlyFees: program.monthlyFees.map(Number),
		classTimes: program.classTimes,
		cardEnabled: isStripeEnabled(),
	};

	return NextResponse.json({ data, error: null });
}
