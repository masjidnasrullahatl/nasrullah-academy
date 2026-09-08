import {
	Alert,
	Button,
	Group,
	NumberInput,
	Select,
	Stack,
	TextInput,
} from '@mantine/core';
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
import { TeacherRow } from '@hooks/react-query/teachers/useGetPagingTeachers';
import { useUpdateTeacher } from '@hooks/react-query/teachers/useUpdateTeacher';

type TeacherFormModalProps = {
	teacher?: TeacherRow;
};

type FormValue = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	email: string;
	hourlyRate: number;
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
			hourlyRate: teacher?.hourlyRate || 0,
			status: teacher?.status || 'ACTIVE',
		},
		validate: zod4Resolver(CreateTeacherSchema),
	});

	const handleSubmit = async (values: FormValue) => {
		if (isEdit && teacher) {
			const payload: UpdateTeacherPayload = {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values.phoneNumber || null,
				email: values.email,
				hourlyRate: values.hourlyRate || null,
				status: values.status,
			};
			await updateTeacher({ id: teacher.id, data: payload });

			notifications.show({
				title: 'Teacher updated',
				message: 'Teacher updated successfully',
				color: 'green',
			});
		} else {
			const payload: CreateTeacherPayload = {
				firstName: values.firstName,
				lastName: values.lastName,
				phoneNumber: values.phoneNumber || null,
				email: values.email,
				hourlyRate: values.hourlyRate || null,
				status: values.status,
			};
			const created = await createTeacher(payload);

			if (created?.inviteError) {
				notifications.show({
					color: 'yellow',
					title: 'Teacher created, invite not sent',
					message: `${created.inviteError}. Use "Resend Invite" to send it again.`,
				});
			} else {
				notifications.show({
					title: 'Teacher created',
					message: 'Teacher created successfully',
					color: 'green',
				});
			}
		}

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
							withAsterisk
							{...form.getInputProps('email')}
						/>
					</Group>

					<NumberInput
						label="Hourly Rate"
						placeholder="0.00"
						prefix="$"
						decimalScale={2}
						fixedDecimalScale
						min={0}
						{...form.getInputProps('hourlyRate')}
					/>

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
