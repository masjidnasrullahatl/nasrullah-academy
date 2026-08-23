import { Alert, Button, Grid, Select, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreateStudentPayload,
	CreateStudentSchema,
} from '@app/api/students/types';

import { ModalFooter } from '@components/ModalFooter';

import { GENDER_OPTIONS, RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useCreateStudent } from '@hooks/react-query/students/useCreateStudent';
import { useUpdateStudent } from '@hooks/react-query/students/useUpdateStudent';

type StudentFormModalProps = {
	student?: any;
	defaultFamilyId?: string;
};

type StudentFormValue = {
	familyId: string;
	firstName: string;
	lastName: string;
	gender: 'BOY' | 'GIRL';
	dateOfBirth: Date | null;
	status: 'ACTIVE' | 'INACTIVE';
	notes: string;
};

export const StudentFormModal = ({
	student,
	defaultFamilyId,
}: StudentFormModalProps) => {
	const { data: families } = useGetPagingFamilies({
		page: 1,
		limit: 1000,
	});

	const { mutateAsync: createStudent, isPending: isCreating, error: createError } =
		useCreateStudent();
	const { mutateAsync: updateStudent, isPending: isUpdating, error: updateError } =
		useUpdateStudent();

	const isEdit = Boolean(student?.id);
	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<StudentFormValue>({
		initialValues: {
			familyId: student?.familyId || defaultFamilyId || '',
			firstName: student?.firstName || '',
			lastName: student?.lastName || '',
			gender: student?.gender || 'BOY',
			dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth) : null,
			status: student?.status || 'ACTIVE',
			notes: student?.notes || '',
		},
		validate: zod4Resolver(CreateStudentSchema),
	});

	const handleSubmit = async (values: StudentFormValue) => {
		const payload: CreateStudentPayload = {
			familyId: values.familyId,
			firstName: values.firstName,
			lastName: values.lastName,
			gender: values.gender,
			dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : null,
			status: values.status,
			notes: values.notes || null,
		};

		if (isEdit) {
			await updateStudent({
				id: student.id,
				data: payload,
			});
		} else {
			await createStudent(payload);
		}

		notifications.show({
			title: isEdit ? 'Student updated' : 'Student created',
			message: isEdit ? 'Student updated successfully' : 'Student created successfully',
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
					<Grid>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<Select
								label="Family"
								placeholder="Select family"
								data={families?.data.map((family) => ({
									value: family.id,
									label: family.name,
								}))}
								searchable
								withAsterisk
								{...form.getInputProps('familyId')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 3 }}>
							<Select
								label="Gender"
								placeholder="Select gender"
								data={GENDER_OPTIONS}
								withAsterisk
								{...form.getInputProps('gender')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 3 }}>
							<Select
								label="Status"
								placeholder="Select status"
								data={RECORD_STATUS_OPTIONS}
								withAsterisk
								{...form.getInputProps('status')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="First name"
								placeholder="Yusuf"
								withAsterisk
								{...form.getInputProps('firstName')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Last name"
								placeholder="Diallo"
								withAsterisk
								{...form.getInputProps('lastName')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<DateInput
								label="Date of birth"
								placeholder="MM/DD/YYYY"
								value={form.values.dateOfBirth}
								onChange={(value) =>
									form.setFieldValue('dateOfBirth', (value as Date | null) || null)
								}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Notes"
								placeholder="Scholarship, payment arrangement, ..."
								{...form.getInputProps('notes')}
							/>
						</Grid.Col>
					</Grid>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Student' : 'Create Student'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
