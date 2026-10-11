import { type NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@supabase/ssr';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@configs/_constant';

import { getAppRole } from './role';

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value),
				);
				supabaseResponse = NextResponse.next({
					request,
				});
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options),
				);
			},
		},
	});

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (
		!user &&
		!request.nextUrl.pathname.startsWith('/register') &&
		!request.nextUrl.pathname.startsWith('/auth/signin') &&
		!request.nextUrl.pathname.startsWith('/auth') &&
		!request.nextUrl.pathname.startsWith('/error')
	) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = '/auth/signin';
		return NextResponse.redirect(url);
	}

	if (user) {
		const role = getAppRole(user);
		const pathname = request.nextUrl.pathname;
		const isDashboard = pathname.startsWith('/dashboard');
		const isTeacherArea = pathname.startsWith('/teacher');

		// Signed in but never granted a role: no access to either portal
		if (role === 'none' && (isDashboard || isTeacherArea)) {
			const url = request.nextUrl.clone();
			url.pathname = '/auth/signin';
			url.search = '?error=no_access';
			return NextResponse.redirect(url);
		}

		if (role === 'teacher' && isDashboard) {
			return NextResponse.redirect(new URL('/teacher', request.url));
		}

		if (role === 'staff' && isTeacherArea) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
}
