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
	UpdateTeacherProfilePayload,
	UpdateTeacherProfileSchema,
} from '@app/api/teacher/me/types';

import PageHeader from '@components/PageHeader';
import Surface from '@components/Surface';

import {
	PATH_TEACHER,
	PATH_TEACHER_ACCOUNTS,
} from '@configs/routes';

import { useGetMyProfile } from '@hooks/react-query/teacher/useGetMyProfile';
import { useUpdateMyProfile } from '@hooks/react-query/teacher/useUpdateMyProfile';

import { formatMoney } from '@utils/money';

import classes from './page.module.css';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'Profile', href: PATH_TEACHER_ACCOUNTS.profile },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherProfilePage() {
	const { data: profile } = useGetMyProfile();
	const {
		mutateAsync: updateProfile,
		isPending,
		error,
		isError,
	} = useUpdateMyProfile();

	const form = useForm<UpdateTeacherProfilePayload>({
		initialValues: {
			firstName: '',
			lastName: '',
			phoneNumber: '',
		},
		validate: zod4Resolver(UpdateTeacherProfileSchema),
	});

	useEffect(() => {
		if (!profile) {
			return;
		}

		form.setValues({
			firstName: profile.firstName,
			lastName: profile.lastName,
			phoneNumber: profile.phoneNumber,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [profile]);

	const handleSubmit = async (values: UpdateTeacherProfilePayload) => {
		await updateProfile(values);

		notifications.show({
			title: 'Profile updated',
			message: 'Your profile was updated successfully',
			color: 'green',
		});
	};

	return (
		<Container fluid>
			<Stack gap="lg">
				<title>Profile | Nasrullah Academy</title>
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
										readOnly
										disabled
										value={profile?.email || ''}
									/>
									<TextInput
										label="First Name"
										withAsterisk
										{...form.getInputProps('firstName')}
									/>
									<TextInput
										label="Last Name"
										withAsterisk
										{...form.getInputProps('lastName')}
									/>
									<TextInput
										label="Phone Number"
										{...form.getInputProps('phoneNumber')}
									/>
									<TextInput
										label="Hourly Rate"
										readOnly
										disabled
										value={
											profile?.hourlyRate === null ||
											profile?.hourlyRate === undefined
												? '—'
												: formatMoney(profile.hourlyRate)
										}
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
