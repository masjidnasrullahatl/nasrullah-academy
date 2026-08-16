import { Alert, Button, Group, Select, Stack, Textarea,TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreateProgramPayload,
	CreateProgramSchema,
	UpdateProgramPayload,
	UpdateProgramSchema,
} from '@app/api/programs/types';

import { ARCHIVE_STATUS_OPTIONS, PROGRAM_CODE_OPTIONS } from '@configs/enums';

import { useCreateProgram } from '@hooks/react-query/programs/useCreateProgram';
import { useUpdateProgram } from '@hooks/react-query/programs/useUpdateProgram';

type ProgramFormModalProps = {
	program?: any;
};

type FormValue = {
	code: 'HIFZ' | 'WEEKEND';
	name: string;
	description: string;
	status: 'ACTIVE' | 'ARCHIVED';
};

export const ProgramFormModal = ({ program }: ProgramFormModalProps) => {
	const isEdit = Boolean(program?.id);

	const { mutateAsync: createProgram, isPending: isCreating, error: createError } =
		useCreateProgram();
	const { mutateAsync: updateProgram, isPending: isUpdating, error: updateError } =
		useUpdateProgram();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			code: program?.code || 'HIFZ',
			name: program?.name || '',
			description: program?.description || '',
			status: program?.status || 'ACTIVE',
		},
		validate: zod4Resolver(isEdit ? UpdateProgramSchema : CreateProgramSchema),
	});

	const handleSubmit = async (values: FormValue) => {
		if (isEdit) {
			const payload: UpdateProgramPayload = {
				name: values.name,
				description: values.description || null,
				status: values.status,
			};
			await updateProgram({ id: program.id, data: payload });
		} else {
			const payload: CreateProgramPayload = {
				code: values.code,
				name: values.name,
				description: values.description || null,
				status: values.status,
			};
			await createProgram(payload);
		}

		notifications.show({
			title: isEdit ? 'Program updated' : 'Program created',
			message: isEdit ? 'Program updated successfully' : 'Program created successfully',
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
					<Select
						label="Code"
						data={PROGRAM_CODE_OPTIONS}
						disabled={isEdit}
						withAsterisk
						{...form.getInputProps('code')}
					/>
					<TextInput label="Name" withAsterisk {...form.getInputProps('name')} />
					<Textarea label="Description" minRows={2} {...form.getInputProps('description')} />
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
							{isEdit ? 'Update Program' : 'Create Program'}
						</Button>
					</Group>
				</Stack>
			</form>
		</Stack>
	);
};
