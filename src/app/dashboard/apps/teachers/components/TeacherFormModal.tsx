import { Alert, Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreateTeacherPayload,
	CreateTeacherSchema,
	UpdateTeacherPayload,
} from '@app/api/teachers/types';

import { ModalFooter } from '@components/ModalFooter';

import { RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useCreateTeacher } from '@hooks/react-query/teachers/useCreateTeacher';
import { useUpdateTeacher } from '@hooks/react-query/teachers/useUpdateTeacher';

type TeacherFormModalProps = {
	teacher?: any;
};

type FormValue = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	email: string;
	status: 'ACTIVE' | 'INACTIVE';
};

export const TeacherFormModal = ({ teacher }: TeacherFormModalProps) => {
	const isEdit = Boolean(teacher?.id);

	const {
		mutateAsync: createTeacher,
		isPending: isCreating,
		error: createError,
	} = useCreateTeacher();
	const {
		mutateAsync: updateTeacher,
		isPending: isUpdating,
		error: updateError,
	} = useUpdateTeacher();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			firstName: teacher?.firstName || '',
			lastName: teacher?.lastName || '',
			phoneNumber: teacher?.phoneNumber || '',
			email: teacher?.email || '',
			status: teacher?.status || 'ACTIVE',
		},
		validate: zod4Resolver(CreateTeacherSchema),
	});

	const handleSubmit = async (values: FormValue) => {
		if (isEdit) {
			const payload: UpdateTeacherPayload = {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values.phoneNumber || null,
				email: values.email || null,
				status: values.status,
			};
			await updateTeacher({ id: teacher.id, data: payload });
		} else {
			const payload: CreateTeacherPayload = {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values.phoneNumber || null,
				email: values.email || null,
				status: values.status,
			};
			await createTeacher(payload);
		}

		notifications.show({
			title: isEdit ? 'Teacher updated' : 'Teacher created',
			message: isEdit
				? 'Teacher updated successfully'
				: 'Teacher created successfully',
			color: 'green',
		});

		modals.closeAll();
	};

	return (
		<Stack>
			{submitError && (
				<Alert color="red" icon={<IconAlertCircle size={16} />}>
					{submitError}
				</Alert>
			)}

			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					<Group grow>
						<TextInput
							label="First name"
							placeholder="Ibrahima Alpha"
							withAsterisk
							{...form.getInputProps('firstName')}
						/>
						<TextInput
							label="Last name"
							placeholder="Diallo"
							withAsterisk
							{...form.getInputProps('lastName')}
						/>
					</Group>

					<Group>
						<TextInput
							flex={1}
							label="Phone number"
							placeholder="404-838-3879"
							{...form.getInputProps('phoneNumber')}
						/>
						<TextInput
							flex={1}
							label="Email"
							placeholder="teacher@example.com"
							{...form.getInputProps('email')}
						/>
					</Group>

					<Select
						label="Status"
						placeholder="Select status"
						data={RECORD_STATUS_OPTIONS}
						withAsterisk
						{...form.getInputProps('status')}
					/>
					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Teacher' : 'Create Teacher'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
