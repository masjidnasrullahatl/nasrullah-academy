import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { SignInPayload } from '@app/api/auth/sign-in/types';

import { PATH_DASHBOARD, PATH_TEACHER } from '@configs/routes';

import { useAuth } from '@hooks/useAuth';

export const useSignIn = () => {
	const router = useRouter();

	const { login } = useAuth();

	return useMutation({
		mutationFn: async (data: SignInPayload) => {
			return login(data.email, data.password);
		},
		onSuccess: (data) => {
			const role =
				data.user?.app_metadata?.role === 'teacher' ? 'teacher' : 'staff';

			router.push(
				role === 'teacher' ? PATH_TEACHER.default : PATH_DASHBOARD.default,
			);
		},
	});
};
