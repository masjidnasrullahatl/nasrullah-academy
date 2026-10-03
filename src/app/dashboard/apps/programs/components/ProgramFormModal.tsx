import {
	Alert,
	Button,
	Divider,
	Group,
	NumberInput,
	Select,
	Stack,
	Switch,
	TagsInput,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';

import {
	CreateProgramPayload,
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
	registrationOpen: boolean;
	slug: string;
	registrationFee: number;
	monthlyFees: string;
	classTimes: string[];
	publicInfo: string;
};

const parseFees = (value: string) =>
	value
		.split(',')
		.map((item) => Number(item.replace(/[^0-9.]/g, '')))
		.filter((item) => !Number.isNaN(item) && item > 0);

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
			registrationOpen: program?.registrationOpen || false,
			slug: program?.slug || '',
			registrationFee: Number(program?.registrationFee || 0),
			monthlyFees: (program?.monthlyFees || []).map(Number).join(', '),
			classTimes: program?.classTimes || [],
			publicInfo: program?.publicInfo || '',
		},
		validate: {
			name: (value) => (value.trim() ? null : 'Name is required'),
			slug: (value) =>
				/^[a-z0-9-]*$/.test(value.trim())
					? null
					: 'Use lowercase letters, numbers and dashes only',
		},
	});

	const handleSubmit = async (values: FormValue) => {
		const registrationSettings = {
			registrationOpen: values.registrationOpen,
			slug: values.slug.trim() || null,
			registrationFee: Number(values.registrationFee) || 0,
			monthlyFees: parseFees(values.monthlyFees),
			classTimes: values.classTimes,
			publicInfo: values.publicInfo || null,
		};

		if (isEdit && program) {
			const payload: UpdateProgramPayload = {
				name: values.name,
				description: values.description || '',
				status: values.status,
				...registrationSettings,
			};

			await updateProgram({ id: program.id, data: payload });
		} else {
			const payload: CreateProgramPayload = {
				name: values.name,
				description: values.description || '',
				status: values.status,
				...registrationSettings,
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

					<Divider label="Online registration" labelPosition="left" />

					<Switch
						label="Open for online registration"
						{...form.getInputProps('registrationOpen', { type: 'checkbox' })}
					/>

					<TextInput
						label="Registration link"
						description={
							form.values.slug
								? `${window.location.origin}/register/${form.values.slug}`
								: 'e.g. hifz → /register/hifz'
						}
						placeholder="hifz"
						{...form.getInputProps('slug')}
					/>

					<Group grow align="start">
						<NumberInput
							label="Registration fee (per child)"
							prefix="$"
							min={0}
							decimalScale={2}
							{...form.getInputProps('registrationFee')}
						/>
						<TextInput
							label="Monthly fee for 1, 2, 3, 4… children"
							description="Family total, separated by commas"
							placeholder="150, 275, 395, 500"
							{...form.getInputProps('monthlyFees')}
						/>
					</Group>

					<TagsInput
						label="Class times parents can choose"
						description="Press Enter after each. Leave empty if there is one schedule."
						placeholder="Class 1: 9:30 am - 11:30 am"
						{...form.getInputProps('classTimes')}
					/>

					<Textarea
						label="Information shown on the registration form"
						description="Schedule, curriculum, supplies…"
						autosize
						minRows={4}
						{...form.getInputProps('publicInfo')}
					/>

					<Text size="xs" c="dimmed">
						Parents paying by card also pay the processing fee (2.2% + $0.30).
					</Text>

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
