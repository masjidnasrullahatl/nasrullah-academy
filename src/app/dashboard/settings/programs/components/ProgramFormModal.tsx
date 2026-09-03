import {
	Alert,
	Button,
	Select,
	Stack,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import {
	CreateProgramPayload,
	CreateProgramSchema,
	UpdateProgramPayload,
} from '@app/api/programs/types';

import { ModalFooter } from '@components/ModalFooter';

import { ARCHIVE_STATUS_OPTIONS } from '@configs/enums';

import { useCreateProgram } from '@hooks/react-query/programs/useCreateProgram';
import { ProgramRow } from '@hooks/react-query/programs/useGetPagingPrograms';
import { useUpdateProgram } from '@hooks/react-query/programs/useUpdateProgram';

type ProgramFormModalProps = {
	program?: ProgramRow;
};

type FormValue = {
	name: string;
	description: string;
	status: 'ACTIVE' | 'ARCHIVED';
};

export const ProgramFormModal = ({ program }: ProgramFormModalProps) => {
	const isEdit = Boolean(program?.id);

	const {
		mutateAsync: createProgram,
		isPending: isCreating,
		error: createError,
	} = useCreateProgram();
	const {
		mutateAsync: updateProgram,
		isPending: isUpdating,
		error: updateError,
	} = useUpdateProgram();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			name: program?.name || '',
			description: program?.description || '',
			status: program?.status || 'ACTIVE',
		},
		validate: zod4Resolver(CreateProgramSchema),
	});

	const handleSubmit = async (values: FormValue) => {
		if (isEdit && program) {
			const payload: UpdateProgramPayload = {
				name: values.name,
				description: values.description || '',
				status: values.status,
			};

			await updateProgram({ id: program.id, data: payload });
		} else {
			const payload: CreateProgramPayload = {
				name: values.name,
				description: values.description || '',
				status: values.status,
			};

			await createProgram(payload);
		}

		notifications.show({
			title: isEdit ? 'Program updated' : 'Program created',
			message: isEdit
				? 'Program updated successfully'
				: 'Program created successfully',
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
						label="Name"
						placeholder="Hifz Program"
						withAsterisk
						{...form.getInputProps('name')}
					/>

					<Textarea
						label="Description"
						placeholder="Optional description"
						autosize
						minRows={3}
						{...form.getInputProps('description')}
					/>

					<Select
						label="Status"
						placeholder="Select status"
						data={ARCHIVE_STATUS_OPTIONS}
						withAsterisk
						{...form.getInputProps('status')}
					/>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Program' : 'Create Program'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
