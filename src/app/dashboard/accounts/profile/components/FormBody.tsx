import { Alert, Button, Paper, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	UpdateProfilePayload,
	UpdateProfileSchema,
} from '@app/api/auth/profile/types';

import Surface from '@components/Surface';

import { useGetProfile } from '@hooks/react-query/auth/useGetProfile';
import { useUpdateProfile } from '@hooks/react-query/auth/useUpdateProfile';

import classes from '../page.module.css';

export const FormBody = () => {
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
			color: 'green',
			title: 'Profile updated',
			message: 'Your profile was updated successfully',
		});
	};

	return (
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
						placeholder="Enter your full name"
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
	);
};
