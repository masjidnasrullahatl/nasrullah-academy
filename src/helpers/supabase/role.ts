import type { User } from '@supabase/supabase-js';

// Access must be granted explicitly in the user's app_metadata.role.
// Anything else (missing or unknown role) gets no access at all.
export type AppRole = 'staff' | 'teacher' | 'none';

export const getAppRole = (
	user: Pick<User, 'app_metadata'> | null | undefined,
): AppRole => {
	const role = user?.app_metadata?.role;

	return role === 'staff' || role === 'teacher' ? role : 'none';
};
