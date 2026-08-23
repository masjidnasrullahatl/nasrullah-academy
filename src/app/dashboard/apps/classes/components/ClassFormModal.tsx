import { Alert, Button, Group, Select, Stack, TextInput } from '@mantine/core';
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

import { ModalFooter } from '@components/ModalFooter';

import { ARCHIVE_STATUS_OPTIONS } from '@configs/enums';

import { useCreateClass } from '@hooks/react-query/classes/useCreateClass';
import { ClassRow } from '@hooks/react-query/classes/useGetPagingClasses';
import { useUpdateClass } from '@hooks/react-query/classes/useUpdateClass';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

type ClassFormModalProps = {
	classItem?: ClassRow;
};

type FormValue = {
	name: string;
	teacherId: string;
	status: 'ACTIVE' | 'ARCHIVED';
};

export const ClassFormModal = ({ classItem }: ClassFormModalProps) => {
	const isEdit = Boolean(classItem?.id);

	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });

	const {
		mutateAsync: createClass,
		isPending: isCreating,
		error: createError,
	} = useCreateClass();

	const {
		mutateAsync: updateClass,
		isPending: isUpdating,
		error: updateError,
	} = useUpdateClass();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			name: classItem?.name || '',
			teacherId: classItem?.teacherId || '',
			status: classItem?.status || 'ACTIVE',
		},
		validate: zod4Resolver(CreateClassSchema),
	});

	const handleSubmit = async (values: FormValue) => {
		const payload: CreateClassPayload | UpdateClassPayload = {
			name: values.name,
			teacherId: values.teacherId || null,
			status: values.status,
		};

		if (isEdit && classItem) {
			await updateClass({
				id: classItem.id,
				data: payload as UpdateClassPayload,
			});
		} else {
			await createClass(payload as CreateClassPayload);
		}

		notifications.show({
			title: isEdit ? 'Class updated' : 'Class created',
			message: isEdit
				? 'Class updated successfully'
				: 'Class created successfully',
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
					<TextInput
						label="Class name"
						placeholder="Hifz 2026"
						withAsterisk
						{...form.getInputProps('name')}
					/>

					<Group wrap="nowrap">
						<Select
							label="Teacher"
							clearable
							searchable
							placeholder="Select a teacher"
							data={teachers?.data.map((teacher) => ({
								value: teacher.id,
								label: `${teacher.firstName} ${teacher.lastName}`,
							}))}
							{...form.getInputProps('teacherId')}
						/>
						<Select
							label="Status"
							placeholder="Select status"
							data={ARCHIVE_STATUS_OPTIONS}
							withAsterisk
							{...form.getInputProps('status')}
						/>
					</Group>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Class' : 'Create Class'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
