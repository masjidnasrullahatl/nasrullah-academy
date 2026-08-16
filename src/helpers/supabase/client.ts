import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@configs/_constant';

export function createClient() {
	return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
