'use client';

import {
	Alert,
	Anchor,
	Button,
	Container,
	Grid,
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

import PageHeader from '@components/PageHeader';
import Surface from '@components/Surface';

import { PATH_ACCOUNTS, PATH_DASHBOARD } from '@configs/routes';

import { useChangePassword } from '@hooks/react-query/auth/useChangePassword';

import classes from './page.module.css';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Accounts', href: PATH_ACCOUNTS.root },
	{ title: 'Change Password', href: PATH_ACCOUNTS.changePassword },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function Page() {
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
			title: 'Password changed',
			message: 'Password changed successfully',
			color: 'green',
		});

		form.reset();
	};

	return (
		<Container fluid>
			<Stack gap="lg">
				<PageHeader title="Change Password" breadcrumbItems={items} />
				<Grid>
					<Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
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
					</Grid.Col>
				</Grid>
			</Stack>
		</Container>
	);
}
