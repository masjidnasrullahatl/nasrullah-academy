'use client';

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { NEXT_PUBLIC_SITE_URL } from '@configs/_constant';
import { PATH_AUTH } from '@configs/routes';

import { useAuthStore } from '@stores/auth';

import { createClient } from '@helpers/supabase/client';

export const useAuth = () => {
	const router = useRouter();
	const supabase = createClient();

	const { setIsFetched, setUser, setSession } = useAuthStore();

	const user = useAuthStore((state) => state.user);
	const session = useAuthStore((state) => state.session);
	const isFetched = useAuthStore((state) => state.isFetched);

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error) console.error('Error getting session:', error);

			setUser(session?.user ?? null);
			setSession(session);
			setIsFetched(true);
		};

		getInitialSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			setUser(session?.user ?? null);
			setSession(session);
		});

		return () => {
			subscription.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase.auth]);

	const login = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;

		return data;
	};

	const logout = async () => {
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				throw error;
			}

			router.push(PATH_AUTH.signin);
		} catch (error) {
			console.error('Error logging out:', error);
			throw error;
		}
	};

	const resetPassword = async (email: string) => {
		const url = `${NEXT_PUBLIC_SITE_URL}/auth/password-reset/confirm`;

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: url,
		});

		if (error) {
			throw error;
		}
	};

	const updatePassword = async (password: string) => {
		const { error } = await supabase.auth.updateUser({
			password,
		});

		if (error) {
			throw error;
		}
	};

	const changePassword = async (password: string) => {
		if (!user?.email) {
			throw new Error('User not found');
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email: user.email,
			password,
		});

		if (error) {
			throw new Error("Password doesn't match");
		}

		return data;
	};

	return {
		user,
		session,
		isFetched,
		isAuthenticated: !!session,
		accessToken: session?.access_token,
		login,
		logout,
		resetPassword,
		updatePassword,
		changePassword,
	};
};
