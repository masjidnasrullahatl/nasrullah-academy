import { NextResponse } from 'next/server';

export const catchZodError = (error: any) => {
	const field = error.issues[0].path[0].toString();

	return NextResponse.json(
		{ error: `${field}: (${error.issues[0].message})`, data: null },
		{ status: 400 },
	);
};
