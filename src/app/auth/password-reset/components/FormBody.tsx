import Link from 'next/link';

import {
	Alert,
	Button,
	Group,
	Paper,
	rem,
	Text,
	TextInput,
	UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconChevronLeft } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	ResetPasswordPayload,
	ResetPasswordSchema,
} from '@app/api/auth/reset-password/types';

import Surface from '@components/Surface';

import { PATH_AUTH } from '@configs/routes';

import { useResetPassword } from '@hooks/react-query/auth/usePasswordReset';

import classes from '../page.module.css';

export const FormBody = () => {
	const mobile_match = useMediaQuery('(max-width: 425px)');

	const form = useForm<ResetPasswordPayload>({
		initialValues: { email: '' },
		validate: zod4Resolver(ResetPasswordSchema),
	});

	const {
		mutateAsync: passwordReset,
		isPending,
		error,
		isError,
	} = useResetPassword();

	const handleSubmit = async (values: typeof form.values) => {
		await passwordReset(values);

		notifications.show({
			color: 'green',
			title: 'Password reset',
			message: 'Check your inbox for a password reset link',
		});
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
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

				<TextInput
					label="Your email"
					placeholder="me@email.com"
					withAsterisk
					{...form.getInputProps('email')}
				/>

				<Group justify="space-between" mt="lg" className={classes.controls}>
					<UnstyledButton
						component={Link}
						href={PATH_AUTH.signin}
						color="dimmed"
						className={classes.control}
					>
						<Group gap={2} align="center">
							<IconChevronLeft
								stroke={1.5}
								style={{ width: rem(14), height: rem(14) }}
							/>
							<Text size="sm" ml={5}>
								Back to the login page
							</Text>
						</Group>
					</UnstyledButton>

					<Button type="submit" fullWidth={mobile_match} loading={isPending}>
						Reset password
					</Button>
				</Group>
			</Surface>
		</form>
	);
};
