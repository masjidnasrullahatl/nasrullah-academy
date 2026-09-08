import {
	Alert,
	Button,
	Paper,
	PasswordInput,
	Stack,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	ChangePasswordPayload,
	ChangePasswordSchema,
} from '@app/api/auth/change-password/types';

import Surface from '@components/Surface';

import { useChangePassword } from '@hooks/react-query/auth/useChangePassword';

import classes from '../page.module.css';

export const FormBody = () => {
	const {
		mutateAsync: changePassword,
		isError,
		error,
		isPending,
	} = useChangePassword();

	const form = useForm<ChangePasswordPayload>({
		initialValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		},
		validate: zod4Resolver(ChangePasswordSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		await changePassword({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		});

		notifications.show({
			color: 'green',
			title: 'Password changed',
			message: 'Password changed successfully',
		});

		form.reset();
	};

	return (
		<Surface component={Paper} className={classes.card}>
			{isError && (
				<Alert
					icon={<IconAlertCircle size="1rem" />}
					title="Password Update Error"
					color="red"
					mb="md"
				>
					{error.message}
				</Alert>
			)}

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="md">
					<Title order={3} c="blue.5" fw="bold">
						Change Password
					</Title>

					<PasswordInput
						label="Current Password"
						placeholder="Your current password"
						withAsterisk
						{...form.getInputProps('currentPassword')}
					/>

					<PasswordInput
						label="New Password"
						placeholder="Your new password"
						withAsterisk
						{...form.getInputProps('newPassword')}
					/>

					<PasswordInput
						label="Confirm New Password"
						placeholder="Confirm your new password"
						withAsterisk
						{...form.getInputProps('confirmNewPassword')}
					/>
				</Stack>

				<Button fullWidth mt="xl" type="submit" loading={isPending}>
					Change Password
				</Button>
			</form>
		</Surface>
	);
};
