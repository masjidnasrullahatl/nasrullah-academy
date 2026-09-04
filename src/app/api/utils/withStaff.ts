/* eslint-disable no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

import { withAuth } from './withAuth';

export function withStaff(
	handler: (req: any, ...args: any[]) => Promise<NextResponse>,
) {
	return withAuth(
		async (req: NextRequest & { user?: any }, ...args: any[]): Promise<NextResponse> => {
			const role = req.user?.app_metadata?.role;

			if (role === 'teacher') {
				return NextResponse.json(
					{ error: 'Forbidden: staff access required', data: null },
					{ status: 403 },
				);
			}

			return handler(req, ...args);
		},
	);
}
