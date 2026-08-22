import { NextResponse } from 'next/server';

export const success = (data: any) => {
	return NextResponse.json({ error: null, data }, { status: 200 });
};

export const badRequest = (msg?: string) => {
	return NextResponse.json(
		{ error: msg || 'Bad request', data: null },
		{ status: 400 },
	);
};

export const internalServerError = (msg?: string) => {
	return NextResponse.json(
		{ error: msg || 'Internal server error', data: null },
		{ status: 500 },
	);
};

export const notFound = (msg?: string) => {
	return NextResponse.json(
		{ error: msg || 'Not found', data: null },
		{ status: 404 },
	);
};
