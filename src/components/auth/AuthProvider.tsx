'use client';

import { usePathname, useRouter } from 'next/navigation';

import { ReactNode, useEffect, useState } from 'react';

import { PATH_AUTH, PATH_DASHBOARD, PATH_TEACHER } from '@configs/routes';

import { useAuthStore } from '@stores/auth';

import { createClient } from '@helpers/supabase/client';
import { getAppRole } from '@helpers/supabase/role';

// Pages that don't require authentication
const RESET_PASSWORD_PAGE = '/auth/password-reset/confirm';

const PUBLIC_PAGES = [
	PATH_AUTH.signin,
	PATH_AUTH.passwordReset,
	PATH_AUTH.accept,
];

// Open to everyone, signed in or not (parents registering their children)
const OPEN_PAGES = ['/register'];

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { setUser, setSession, setRole } = useAuthStore();

	const isOpenPage = OPEN_PAGES.some((page) => pathname?.startsWith(page));
	const isPublicPage = PUBLIC_PAGES.some((page) => pathname?.startsWith(page));
	const isResetPasswordPage = pathname?.startsWith(RESET_PASSWORD_PAGE);
	const isSigninPage = pathname?.startsWith(PATH_AUTH.signin);
	const isTeacherPath = pathname?.startsWith(PATH_TEACHER.root);
	const isDashboardPath = pathname?.startsWith(PATH_DASHBOARD.root);

	useEffect(() => {
		if (isOpenPage) return;

		const supabase = createClient();

		// Check initial session
		const checkSession = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error('Session check error:', error);
					if (!isPublicPage) {
						router.push(PATH_AUTH.signin);
					}
					return;
				}

				if (!session) {
					setUser(null);
					setSession(null);
					setRole('none');

					if (!isPublicPage) {
						router.push(PATH_AUTH.signin);
					}
					return;
				}

				let role = getAppRole(session.user);

				// The stored session can predate a role change; ask the server
				if (role === 'none') {
					const { data } = await supabase.auth.refreshSession();
					role = getAppRole(data.session?.user);
				}

				if (role === 'none') {
					await supabase.auth.signOut();
					setUser(null);
					setSession(null);
					setRole('none');
					router.push(`${PATH_AUTH.signin}?error=no_access`);
					return;
				}

				setUser(session.user);
				setSession(session);
				setRole(role);

				if (isSigninPage && !isResetPasswordPage) {
					router.push(
						role === 'teacher' ? PATH_TEACHER.default : PATH_DASHBOARD.default,
					);
					return;
				}

				if (role === 'teacher' && isDashboardPath) {
					router.push(PATH_TEACHER.default);
					return;
				}

				if (role === 'staff' && isTeacherPath) {
					router.push(PATH_DASHBOARD.default);
					return;
				}

				setIsAuthenticated(true);
			} catch (error) {
				console.error('Auth check error:', error);
				if (!isPublicPage) {
					router.push(PATH_AUTH.signin);
				}
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();

		// Listen for auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				setUser(null);
				setSession(null);
				setRole('none');
				setIsAuthenticated(false);
				if (!isPublicPage) {
					router.push(PATH_AUTH.signin);
				}
			} else if (event === 'SIGNED_IN') {
				const role = getAppRole(session.user);

				if (role === 'none') {
					await supabase.auth.signOut();
					router.push(`${PATH_AUTH.signin}?error=no_access`);
					return;
				}

				setUser(session.user);
				setSession(session);
				setRole(role);
				setIsAuthenticated(true);
				// If user signs in on a public page, redirect to dashboard
				if (isPublicPage && !isResetPasswordPage) {
					router.push(
						role === 'teacher' ? PATH_TEACHER.default : PATH_DASHBOARD.default,
					);
				}

				if (role === 'teacher' && isDashboardPath) {
					router.push(PATH_TEACHER.default);
				}

				if (role === 'staff' && isTeacherPath) {
					router.push(PATH_DASHBOARD.default);
				}
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [
		isDashboardPath,
		isOpenPage,
		isPublicPage,
		isResetPasswordPage,
		isSigninPage,
		isTeacherPath,
		router,
		setRole,
		setSession,
		setUser,
	]);

	if (isOpenPage) return <>{children}</>;

	// Show loading while checking authentication
	if (isLoading) return null;

	// For public pages, always render children
	if (isPublicPage) {
		return <>{children}</>;
	}

	// For protected pages, only render if authenticated
	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
}
