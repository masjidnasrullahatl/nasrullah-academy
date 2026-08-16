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
	CreateClassPayload,
	CreateClassSchema,
	UpdateClassPayload,
} from '@app/api/classes/types';

import { ARCHIVE_STATUS_OPTIONS, CLASS_SESSION_OPTIONS } from '@configs/enums';

import { useCreateClass } from '@hooks/react-query/classes/useCreateClass';
import { useUpdateClass } from '@hooks/react-query/classes/useUpdateClass';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

type ClassFormModalProps = {
	classItem?: any;
};

type FormValue = {
	name: string;
	programId: string;
	teacherId: string;
	session: 'AM' | 'PM' | 'AM_PM' | 'NA';
	room: string;
	schoolYear: number;
	capacity: number | '';
	status: 'ACTIVE' | 'ARCHIVED';
};

export const ClassFormModal = ({ classItem }: ClassFormModalProps) => {
	const isEdit = Boolean(classItem?.id);

	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });
	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });

	const { mutateAsync: createClass, isPending: isCreating, error: createError } =
		useCreateClass();
	const { mutateAsync: updateClass, isPending: isUpdating, error: updateError } =
		useUpdateClass();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			name: classItem?.name || '',
			programId: classItem?.programId || '',
			teacherId: classItem?.teacherId || '',
			session: classItem?.session || 'NA',
			room: classItem?.room || '',
			schoolYear: classItem?.schoolYear || new Date().getFullYear(),
			capacity: classItem?.capacity || '',
			status: classItem?.status || 'ACTIVE',
		},
		validate: zod4Resolver(CreateClassSchema),
	});

	const handleSubmit = async (values: FormValue) => {
		const payload: CreateClassPayload | UpdateClassPayload = {
			name: values.name,
			programId: values.programId,
			teacherId: values.teacherId || null,
			session: values.session,
			room: values.room || null,
			schoolYear: values.schoolYear,
			capacity: values.capacity === '' ? null : Number(values.capacity),
			status: values.status,
		};

		if (isEdit) {
			await updateClass({ id: classItem.id, data: payload as UpdateClassPayload });
		} else {
			await createClass(payload as CreateClassPayload);
		}

		notifications.show({
			title: isEdit ? 'Class updated' : 'Class created',
			message: isEdit ? 'Class updated successfully' : 'Class created successfully',
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
					<TextInput label="Class name" withAsterisk {...form.getInputProps('name')} />
					<Select
						label="Program"
						data={programs?.data.map((program) => ({
							value: program.id,
							label: program.name,
						}))}
						withAsterisk
						{...form.getInputProps('programId')}
					/>
					<Select
						label="Teacher"
						clearable
						searchable
						data={teachers?.data.map((teacher) => ({
							value: teacher.id,
							label: `${teacher.firstName} ${teacher.lastName}`,
						}))}
						{...form.getInputProps('teacherId')}
					/>
					<Group grow>
						<Select
							label="Session"
							data={CLASS_SESSION_OPTIONS}
							withAsterisk
							{...form.getInputProps('session')}
						/>
						<TextInput label="Room" {...form.getInputProps('room')} />
					</Group>
					<Group grow>
						<NumberInput
							label="School Year"
							withAsterisk
							min={2000}
							max={2100}
							{...form.getInputProps('schoolYear')}
						/>
						<NumberInput
							label="Capacity"
							min={0}
							allowDecimal={false}
							{...form.getInputProps('capacity')}
						/>
					</Group>
					<Select
						label="Status"
						data={ARCHIVE_STATUS_OPTIONS}
						withAsterisk
						{...form.getInputProps('status')}
					/>

					<Group justify="flex-end">
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Class' : 'Create Class'}
						</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	);
};
