import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@hooks/useAuth';

export const useUpdatePassword = () => {
	const { updatePassword } = useAuth();

	return useMutation({
		mutationFn: async ({ password }: { password: string }) => {
			return updatePassword(password);
		},
	});
};
