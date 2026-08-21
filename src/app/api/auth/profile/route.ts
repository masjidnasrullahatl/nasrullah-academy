import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';
import { ZodError } from 'zod';

import { ApiResponse, AuthRequest } from '@app/api/types/common';
import { catchZodError } from '@app/api/utils/catchZodError';
import { withAuth } from '@app/api/utils/withAuth';

import {
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL,
} from '@configs/_constant';

import {
	ProfilePayload,
	UpdateProfileSchema,
} from './types';

const mapProfile = (request: AuthRequest): ProfilePayload => {
	const userMetadata = request.user.user_metadata ?? {};

	return {
		id: request.user.id,
		email: request.user.email ?? '',
		fullName: userMetadata.full_name ?? userMetadata.fullName ?? '',
		phoneNumber: userMetadata.phone_number ?? userMetadata.phoneNumber ?? '',
	};
};

const get = async (
	request: AuthRequest,
): Promise<NextResponse<ApiResponse<ProfilePayload>>> => {
	return NextResponse.json({ data: mapProfile(request) });
};

const update = async (
	request: AuthRequest,
): Promise<NextResponse<ApiResponse<ProfilePayload | null>>> => {
	try {
		const data = UpdateProfileSchema.parse(await request.json());

		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
			request.user.id,
			{
				user_metadata: {
					...request.user.user_metadata,
					full_name: data.fullName,
					phone_number: data.phoneNumber ?? '',
				},
			},
		);

		if (error) {
			return NextResponse.json(
				{ error: error.message, data: null },
				{ status: 400 },
			);
		}

		const userMetadata = updatedUser.user.user_metadata ?? {};

		return NextResponse.json({
			data: {
				id: updatedUser.user.id,
				email: updatedUser.user.email ?? '',
				fullName: userMetadata.full_name ?? userMetadata.fullName ?? '',
				phoneNumber: userMetadata.phone_number ?? userMetadata.phoneNumber ?? '',
			},
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return catchZodError(error);
		}

		return NextResponse.json(
			{ error: 'Internal server error', data: null },
			{ status: 500 },
		);
	}
};

export const GET = withAuth(get);
export const PUT = withAuth(update);
