import Link from 'next/link';

import {
	Alert,
	Button,
	Group,
	Paper,
	PasswordInput,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { SignInPayload, SignInSchema } from '@app/api/auth/sign-in/types';

import Surface from '@components/Surface';

import { PATH_AUTH } from '@configs/routes';

import { useSignIn } from '@hooks/react-query/auth/useSignIn';

import classes from '../page.module.css';

const LINK_PROPS = {
	className: classes.link,
};

export const FormBody = () => {
	const { mutateAsync: signIn, isPending, error, isError } = useSignIn();

	const form = useForm<SignInPayload>({
		initialValues: { email: '', password: '' },
		validate: zod4Resolver(SignInSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		await signIn(values);
	};

	return (
		<Surface component={Paper} className={classes.card}>
			{isError && (
				<Alert
					mb="md"
					color="red"
					title="Authentication Error"
					icon={<IconAlertCircle size="1rem" />}
				>
					{error.message}
				</Alert>
			)}

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<TextInput
					label="Email"
					placeholder="you@example.com"
					withAsterisk
					classNames={{ label: classes.label }}
					{...form.getInputProps('email')}
				/>

				<PasswordInput
					label="Password"
					placeholder="Your password"
					withAsterisk
					mt="md"
					classNames={{ label: classes.label }}
					{...form.getInputProps('password')}
				/>

				<Group justify="flex-end" mt="xs">
					<Text
						component={Link}
						href={PATH_AUTH.passwordReset}
						size="sm"
						{...LINK_PROPS}
					>
						Forgot password?
					</Text>
				</Group>

				<Button fullWidth mt="sm" type="submit" loading={isPending}>
					Sign in
				</Button>
			</form>
		</Surface>
	);
};
