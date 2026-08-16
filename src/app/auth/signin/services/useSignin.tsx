import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { PATH_DASHBOARD } from '@configs/routes';

import { useAuth } from '@hooks/useAuth';

import { SigninPayload } from '../types';

export const useSignin = () => {
	const router = useRouter();
	const { login } = useAuth();

	return useMutation({
		mutationFn: async (data: SigninPayload) => {
			return login(data.email, data.password);
		},
		onSuccess: () => {
			router.push(PATH_DASHBOARD.default);
		},
	});
};
