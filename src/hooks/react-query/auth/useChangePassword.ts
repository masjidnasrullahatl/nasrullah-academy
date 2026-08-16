import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@hooks/useAuth';

type ChangePasswordParams = {
	currentPassword: string;
	newPassword: string;
};

export const useChangePassword = () => {
	const { changePassword, updatePassword } = useAuth();

	return useMutation({
		mutationFn: async ({ currentPassword, newPassword }: ChangePasswordParams) => {
			await changePassword(currentPassword);
			await updatePassword(newPassword);

			return true;
		},
	});
};
