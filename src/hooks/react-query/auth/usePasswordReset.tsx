import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@hooks/useAuth';

export const useResetPassword = () => {
	const { resetPassword } = useAuth();

	return useMutation({
		mutationFn: async (data: { email: string }) => {
			return resetPassword(data.email);
		},
	});
};
