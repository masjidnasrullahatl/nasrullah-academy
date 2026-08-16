declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production';
			ANALYZE: string;
			NEXT_PUBLIC_SUPABASE_URL: string;
			NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
		}
	}
}

export {};
