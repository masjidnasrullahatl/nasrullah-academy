'use client';

import { usePathname, useRouter } from 'next/navigation';

import { ReactNode, useEffect, useState } from 'react';

import { PATH_AUTH, PATH_DASHBOARD, PATH_TEACHER } from '@configs/routes';

import { useAuthStore } from '@stores/auth';

import { createClient } from '@helpers/supabase/client';

// Pages that don't require authentication
const RESET_PASSWORD_PAGE = '/auth/password-reset/confirm';

const PUBLIC_PAGES = [PATH_AUTH.signin, PATH_AUTH.passwordReset];

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { setUser, setSession, setRole } = useAuthStore();

	const isPublicPage = PUBLIC_PAGES.some((page) => pathname?.startsWith(page));
	const isResetPasswordPage = pathname?.startsWith(RESET_PASSWORD_PAGE);
	const isSigninPage = pathname?.startsWith(PATH_AUTH.signin);
	const isTeacherPath = pathname?.startsWith(PATH_TEACHER.root);
	const isDashboardPath = pathname?.startsWith(PATH_DASHBOARD.root);

	useEffect(() => {
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
					setRole('staff');

					if (!isPublicPage) {
						router.push(PATH_AUTH.signin);
					}
					return;
				}

				const role =
					session.user?.app_metadata?.role === 'teacher' ? 'teacher' : 'staff';

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
				setRole('staff');
				setIsAuthenticated(false);
				if (!isPublicPage) {
					router.push(PATH_AUTH.signin);
				}
			} else if (event === 'SIGNED_IN') {
				const role =
					session.user?.app_metadata?.role === 'teacher' ? 'teacher' : 'staff';

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
		isPublicPage,
		isResetPasswordPage,
		isSigninPage,
		isTeacherPath,
		router,
		setRole,
		setSession,
		setUser,
	]);

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
