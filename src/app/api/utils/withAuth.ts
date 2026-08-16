/* eslint-disable no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from '@configs/_constant';

export function withAuth(
	handler: (req: any, ...args: any[]) => Promise<NextResponse>,
) {
	return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
		const authHeader = req.headers.get('authorization');

		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const token = authHeader.split(' ')[1];

		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return NextResponse.json(
				{ error: 'Invalid or expired token' },
				{ status: 401 },
			);
		}

		const authRequest = Object.assign(req, { user });

		return handler(authRequest, ...args);
	};
}
