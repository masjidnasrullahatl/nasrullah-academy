import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { SignInPayload } from '@app/api/auth/sign-in/types';

import { PATH_DASHBOARD, PATH_TEACHER } from '@configs/routes';

import { useAuth } from '@hooks/useAuth';

import { getAppRole } from '@helpers/supabase/role';

export const useSignIn = () => {
	const router = useRouter();

	const { login } = useAuth();

	return useMutation({
		mutationFn: async (data: SignInPayload) => {
			return login(data.email, data.password);
		},
		onSuccess: (data) => {
			const role = getAppRole(data.user);

			// A login with no role is signed out by the AuthProvider
			if (role === 'none') return;

			router.push(
				role === 'teacher' ? PATH_TEACHER.default : PATH_DASHBOARD.default,
			);
		},
	});
};
