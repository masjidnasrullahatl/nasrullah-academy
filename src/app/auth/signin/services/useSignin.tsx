import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { PATH_DASHBOARD, PATH_TEACHER } from '@configs/routes';

import { useAuth } from '@hooks/useAuth';

import { SigninPayload } from '../types';

export const useSignin = () => {
	const router = useRouter();
	const { login } = useAuth();

	return useMutation({
		mutationFn: async (data: SigninPayload) => {
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
