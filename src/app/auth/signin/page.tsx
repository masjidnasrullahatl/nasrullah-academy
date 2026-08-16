'use client';

import Link from 'next/link';

import {
	Alert,
	Button,
	Group,
	Paper,
	PasswordInput,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import Surface from '@components/Surface';

import { PATH_AUTH } from '@configs/routes';

import { useSignin } from './services/useSignin';
import classes from './page.module.css';
import { SigninPayload, SigninSchema } from './types';

const LINK_PROPS = {
	className: classes.link,
};

export default function Page() {
	const { mutateAsync: signin, isPending, error, isError } = useSignin();

	const form = useForm<SigninPayload>({
		initialValues: { email: '', password: '' },
		validate: zod4Resolver(SigninSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		await signin(values);
	};

	return (
		<>
			<Title ta="center" c="blue">
				Sign In
			</Title>
			<Text ta="center">Sign in to your account to continue</Text>

			<Surface component={Paper} className={classes.card}>
				{isError && (
					<Alert
						icon={<IconAlertCircle size="1rem" />}
						title="Authentication Error"
						color="red"
						mb="md"
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
		</>
	);
}
