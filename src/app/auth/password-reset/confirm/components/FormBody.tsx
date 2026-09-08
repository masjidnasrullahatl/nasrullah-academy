import { useRouter } from 'next/navigation';

import { Alert, Button, Paper, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	ConfirmResetPasswordPayload,
	ConfirmResetPasswordSchema,
} from '@app/api/auth/reset-password/types';

import Surface from '@components/Surface';

import { PATH_AUTH } from '@configs/routes';

import { useUpdatePassword } from '@hooks/react-query/auth/useUpdatePassword';

import classes from '../../page.module.css';

export const FormBody = () => {
	const router = useRouter();

	const {
		mutateAsync: confirmReset,
		isPending,
		error,
		isError,
	} = useUpdatePassword();

	const form = useForm<ConfirmResetPasswordPayload>({
		initialValues: {
			password: '',
			confirmPassword: '',
		},
		validate: zod4Resolver(ConfirmResetPasswordSchema),
	});

	const handleSubmit = async (values: ConfirmResetPasswordPayload) => {
		await confirmReset({
			password: values.password,
		});

		notifications.show({
			title: 'Success',
			message: 'Password reset successfully',
			color: 'green',
			icon: <IconCheck size="1rem" />,
		});

		router.push(PATH_AUTH.signin);
	};

	return (
		<Surface component={Paper} className={classes.card}>
			{isError && (
				<Alert
					icon={<IconAlertCircle size="1rem" />}
					title="Reset Password Error"
					color="red"
					mb="md"
				>
					{error.message}
				</Alert>
			)}

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					<PasswordInput
						label="New Password"
						placeholder="Enter your new password"
						withAsterisk
						{...form.getInputProps('password')}
					/>

					<PasswordInput
						label="Confirm New Password"
						placeholder="Confirm your new password"
						withAsterisk
						{...form.getInputProps('confirmPassword')}
					/>

					<Button fullWidth type="submit" loading={isPending}>
						Reset Password
					</Button>
				</Stack>
			</form>
		</Surface>
	);
};
