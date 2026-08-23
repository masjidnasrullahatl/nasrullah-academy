import { useMemo } from 'react';

import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Divider,
	Grid,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreateFamilyPayload,
	CreateFamilySchema,
} from '@app/api/families/types';

import { ModalFooter } from '@components/ModalFooter';

import { GENDER_OPTIONS, RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useCreateFamily } from '@hooks/react-query/families/useCreateFamily';
import { useUpdateFamily } from '@hooks/react-query/families/useUpdateFamily';

type FamilyFormModalProps = {
	family?: any;
};

type StudentFormValue = {
	id?: string;
	firstName: string;
	lastName: string;
	gender: 'BOY' | 'GIRL';
	dateOfBirth: Date | null;
	status: 'ACTIVE' | 'INACTIVE';
	notes: string;
};

type FamilyFormValue = {
	name: string;
	fatherName: string;
	motherName: string;
	primaryPhone: string;
	secondaryPhone: string;
	email: string;
	address: string;
	status: 'ACTIVE' | 'INACTIVE';
	notes: string;
	students: StudentFormValue[];
};

const emptyStudent = (): StudentFormValue => ({
	firstName: '',
	lastName: '',
	gender: 'BOY',
	dateOfBirth: null,
	status: 'ACTIVE',
	notes: '',
});

export const FamilyFormModal = ({ family }: FamilyFormModalProps) => {
	const { mutateAsync: createFamily, isPending: isCreating, error: createError } =
		useCreateFamily();
	const { mutateAsync: updateFamily, isPending: isUpdating, error: updateError } =
		useUpdateFamily();

	const isEdit = Boolean(family?.id);
	const isPending = isCreating || isUpdating;

	const form = useForm<FamilyFormValue>({
		initialValues: {
			name: family?.name || '',
			fatherName: family?.fatherName || '',
			motherName: family?.motherName || '',
			primaryPhone: family?.primaryPhone || '',
			secondaryPhone: family?.secondaryPhone || '',
			email: family?.email || '',
			address: family?.address || '',
			status: family?.status || 'ACTIVE',
			notes: family?.notes || '',
			students:
				family?.students?.map((student: any) => ({
					id: student.id,
					firstName: student.firstName,
					lastName: student.lastName,
					gender: student.gender,
					dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
					status: student.status,
					notes: student.notes || '',
				})) || [],
		},
		validate: zod4Resolver(CreateFamilySchema),
	});

	const submitError = useMemo(
		() => (createError || updateError ? (createError || updateError)?.message : ''),
		[createError, updateError],
	);

	const handleSubmit = async (values: FamilyFormValue) => {
		const payload: CreateFamilyPayload = {
			name: values.name,
			fatherName: values.fatherName || null,
			motherName: values.motherName || null,
			primaryPhone: values.primaryPhone,
			secondaryPhone: values.secondaryPhone || null,
			email: values.email || null,
			address: values.address || null,
			status: values.status,
			notes: values.notes || null,
			students: values.students.map((student) => ({
				id: student.id,
				firstName: student.firstName,
				lastName: student.lastName,
				gender: student.gender,
				dateOfBirth: student.dateOfBirth
					? student.dateOfBirth.toISOString().split('T')[0]
					: null,
				status: student.status,
				notes: student.notes || null,
			})),
		};

		if (isEdit) {
			await updateFamily({
				id: family.id,
				data: payload,
			});
		} else {
			await createFamily(payload);
		}

		notifications.show({
			title: isEdit ? 'Family updated' : 'Family created',
			message: isEdit
				? 'Family information updated successfully'
				: 'Family created successfully',
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
					<Stack gap="xs">
						<Text fw={700}>Family information</Text>
						<Divider />
					</Stack>

					<Grid>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Family / Parent name"
								placeholder="Ibrahima Alpha Diallo"
								withAsterisk
								{...form.getInputProps('name')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
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
								label="Father name"
								placeholder="Ibrahima Alpha Diallo"
								{...form.getInputProps('fatherName')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Mother name"
								placeholder="Aminata Diallo"
								{...form.getInputProps('motherName')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Primary phone"
								placeholder="404-838-3879"
								withAsterisk
								{...form.getInputProps('primaryPhone')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Secondary phone"
								placeholder="404-838-3879"
								{...form.getInputProps('secondaryPhone')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Email"
								placeholder="parent@example.com"
								{...form.getInputProps('email')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<TextInput
								label="Address"
								placeholder="1234 Main St, Atlanta, GA"
								{...form.getInputProps('address')}
							/>
						</Grid.Col>
						<Grid.Col span={12}>
							<Textarea
								label="Notes"
								placeholder="Scholarship, payment arrangement, ..."
								minRows={2}
								{...form.getInputProps('notes')}
							/>
						</Grid.Col>
					</Grid>

					<Stack gap="xs" mt="sm">
						<Group justify="space-between" align="center">
							<Text fw={700}>Students</Text>
							<Button
								variant="light"
								size="xs"
								leftSection={<IconPlus size={14} />}
								onClick={() => form.insertListItem('students', emptyStudent())}
							>
								Add student
							</Button>
						</Group>
						<Divider />
					</Stack>

					{form.values.students.length === 0 ? (
						<Text c="dimmed" size="sm">
							No students yet. Click Add student to include children in this family.
						</Text>
					) : (
						<Stack>
							{form.values.students.map((student, index) => (
								<Stack key={student.id || index} p="sm" bd="1px solid #e9ecef">
									<Group justify="space-between" align="center">
										<Badge variant="light">Student {index + 1}</Badge>
										<ActionIcon
											color="red"
											onClick={() => form.removeListItem('students', index)}
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Group>

									<Grid>
										<Grid.Col span={{ base: 12, md: 3 }}>
											<TextInput
												label="First name"
												placeholder="Yusuf"
												withAsterisk
												{...form.getInputProps(`students.${index}.firstName`)}
											/>
										</Grid.Col>
										<Grid.Col span={{ base: 12, md: 3 }}>
											<TextInput
												label="Last name"
												placeholder="Diallo"
												withAsterisk
												{...form.getInputProps(`students.${index}.lastName`)}
											/>
										</Grid.Col>
										<Grid.Col span={{ base: 12, md: 2 }}>
											<Select
												label="Gender"
												placeholder="Select gender"
												data={GENDER_OPTIONS}
												withAsterisk
												{...form.getInputProps(`students.${index}.gender`)}
											/>
										</Grid.Col>
										<Grid.Col span={{ base: 12, md: 4 }}>
											<DateInput
												label="Date of birth"
												placeholder="MM/DD/YYYY"
												value={form.values.students[index].dateOfBirth}
												onChange={(value) =>
													form.setFieldValue(
														`students.${index}.dateOfBirth`,
														(value as Date | null) || null,
													)
												}
											/>
										</Grid.Col>
										<Grid.Col span={{ base: 12, md: 2 }}>
											<Select
												label="Status"
												placeholder="Select status"
												data={RECORD_STATUS_OPTIONS}
												withAsterisk
												{...form.getInputProps(`students.${index}.status`)}
											/>
										</Grid.Col>
										<Grid.Col span={{ base: 12, md: 10 }}>
											<TextInput
												label="Notes"
												placeholder="Scholarship, payment arrangement, ..."
												{...form.getInputProps(`students.${index}.notes`)}
											/>
										</Grid.Col>
									</Grid>
								</Stack>
							))}
						</Stack>
					)}

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Family' : 'Create Family'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
