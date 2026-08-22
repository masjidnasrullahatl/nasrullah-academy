import { AuthRequest } from '@app/api/types/common';

import { ProfilePayload } from './types';

export const mapProfile = (request: AuthRequest): ProfilePayload => {
	const userMetadata = request.user.user_metadata ?? {};

	return {
		id: request.user.id,
		email: request.user.email ?? '',
		fullName: userMetadata.full_name ?? userMetadata.fullName ?? '',
		phoneNumber: userMetadata.phone_number ?? userMetadata.phoneNumber ?? '',
	};
};
