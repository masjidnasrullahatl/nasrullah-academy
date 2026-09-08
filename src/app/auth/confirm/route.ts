import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@helpers/supabase/server';

// Subset of Supabase EmailOtpType we accept here. Imported inline instead of from
// '@supabase/supabase-js' because the deep `export *` chain breaks eslint import/named.
type ConfirmOtpType = 'invite' | 'recovery';

const ALLOWED_TYPES: ConfirmOtpType[] = ['invite', 'recovery'];

const DEFAULT_NEXT = '/auth/password-reset/confirm';

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url);

	const tokenHash = searchParams.get('token_hash');
	const type = searchParams.get('type');
	const nextParam = searchParams.get('next') || DEFAULT_NEXT;

	// Chặn open redirect: chỉ nhận đường dẫn tương đối trong chính app
	const next =
		nextParam.startsWith('/') && !nextParam.startsWith('//')
			? nextParam
			: DEFAULT_NEXT;

	const redirectWithError = (message: string) =>
		NextResponse.redirect(
			`${origin}${DEFAULT_NEXT}?error=invalid_link&error_description=${encodeURIComponent(
				message,
			)}`,
		);

	if (!tokenHash || !type || !ALLOWED_TYPES.includes(type as ConfirmOtpType)) {
		return redirectWithError('The link is missing or malformed');
	}

	const supabase = await createClient();

	const { error } = await supabase.auth.verifyOtp({
		type: type as ConfirmOtpType,
		token_hash: tokenHash,
	});

	if (error) return redirectWithError(error.message);

	return NextResponse.redirect(`${origin}${next}`);
}
