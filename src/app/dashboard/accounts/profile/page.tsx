'use client';

import { useEffect } from 'react';

import {
	Alert,
	Anchor,
	Button,
	Container,
	Grid,
	Paper,
	Stack,
	TextInput,
	Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	UpdateProfilePayload,
	UpdateProfileSchema,
} from '@app/api/auth/profile/types';

import PageHeader from '@components/PageHeader';
import Surface from '@components/Surface';

import { PATH_ACCOUNTS, PATH_DASHBOARD } from '@configs/routes';

import { useGetProfile } from '@hooks/react-query/auth/useGetProfile';
import { useUpdateProfile } from '@hooks/react-query/auth/useUpdateProfile';

import classes from './page.module.css';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Accounts', href: PATH_ACCOUNTS.root },
	{ title: 'Profile', href: PATH_ACCOUNTS.profile },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function ProfilePage() {
	const { data: profile } = useGetProfile();

	const {
		mutateAsync: updateProfile,
		isPending,
		error,
		isError,
	} = useUpdateProfile();

	const form = useForm<UpdateProfilePayload>({
		initialValues: {
			fullName: '',
			phoneNumber: '',
		},
		validate: zod4Resolver(UpdateProfileSchema),
	});

	const handleSubmit = async (values: typeof form.values) => {
		await updateProfile(values);

		notifications.show({
			title: 'Profile updated',
			message: 'Your profile was updated successfully',
			color: 'green',
		});
	};

	useEffect(() => {
		if (profile) {
			form.setValues({
				fullName: profile.fullName,
				phoneNumber: profile.phoneNumber,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile]);

	return (
		<Container fluid>
			<Stack gap="lg">
				<PageHeader title="Profile" breadcrumbItems={items} />
				<Grid>
					<Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
						<Surface component={Paper} className={classes.card}>
							{isError && (
								<Alert
									icon={<IconAlertCircle size="1rem" />}
									title="Update Error"
									color="red"
									mb="md"
								>
									{error.message}
								</Alert>
							)}

							<form onSubmit={form.onSubmit(handleSubmit)}>
								<Stack gap="md">
									<Title order={3} c="blue.5" fw="bold">
										Profile Details
									</Title>

									<TextInput
										label="Email"
										placeholder="you@example.com"
										withAsterisk
										readOnly
										disabled
										value={profile?.email || ''}
									/>
									<TextInput
										label="Full name"
										placeholder="Abdullah Ahmed"
										withAsterisk
										{...form.getInputProps('fullName')}
									/>
									<TextInput
										label="Phone number"
										placeholder="(123) 456-7890"
										{...form.getInputProps('phoneNumber')}
									/>
								</Stack>

								<Button fullWidth mt="xl" type="submit" loading={isPending}>
									Update
								</Button>
							</form>
						</Surface>
					</Grid.Col>
				</Grid>
			</Stack>
		</Container>
	);
}
