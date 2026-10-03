import { useMemo } from 'react';

import {
	Alert,
	Autocomplete,
	Button,
	Grid,
	SegmentedControl,
	Select,
	Stack,
	Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { MilestoneType } from '@prisma/client';
import { IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { CreateMilestonePayload } from '@app/api/milestones/types';

import { ModalFooter } from '@components/ModalFooter';

import { useCreateMilestone } from '@hooks/react-query/milestones/useCreateMilestone';
import { useGetMilestoneBooks } from '@hooks/react-query/milestones/useGetMilestoneBooks';
import {
	MilestoneRow,
	useGetPagingMilestones,
} from '@hooks/react-query/milestones/useGetPagingMilestones';
import { useUpdateMilestone } from '@hooks/react-query/milestones/useUpdateMilestone';
import { useGetPagingStudents } from '@hooks/react-query/students/useGetPagingStudents';

import {
	JUZ_COUNT,
	JUZ_OPTIONS,
	MILESTONE_TYPE_OPTIONS,
	parseCompletedAt,
} from '../utils';

type Props = {
	milestone?: MilestoneRow;
	defaultStudentId?: string;
};

type FormValue = {
	studentId: string;
	type: MilestoneType;
	juzNumber: string | null;
	bookName: string;
	completedAt: Date | null;
	notes: string;
};

export const MilestoneFormModal = ({ milestone, defaultStudentId }: Props) => {
	const isEdit = Boolean(milestone?.id);

	const { data: students } = useGetPagingStudents({ page: 1, limit: 1000 });
	const { data: bookNames } = useGetMilestoneBooks();

	const {
		mutateAsync: createMilestone,
		isPending: isCreating,
		error: createError,
	} = useCreateMilestone();
	const {
		mutateAsync: updateMilestone,
		isPending: isUpdating,
		error: updateError,
	} = useUpdateMilestone();

	const isPending = isCreating || isUpdating;
	const submitError = (createError || updateError)?.message;

	const form = useForm<FormValue>({
		initialValues: {
			studentId: milestone?.studentId || defaultStudentId || '',
			type: milestone?.type || 'JUZ',
			juzNumber: milestone?.juzNumber ? String(milestone.juzNumber) : null,
			bookName: milestone?.bookName || '',
			completedAt: milestone
				? parseCompletedAt(milestone.completedAt)
				: new Date(),
			notes: milestone?.notes || '',
		},
		validate: {
			studentId: (value) => (value ? null : 'Student is required'),
			juzNumber: (value, values) =>
				values.type === 'JUZ' && !value ? 'Select the Juz' : null,
			bookName: (value, values) =>
				values.type === 'BOOK' && !value.trim()
					? 'Book name is required'
					: null,
			completedAt: (value) => (value ? null : 'Date is required'),
		},
	});

	// Juz already recorded for this student are disabled so they can't be added twice
	const { data: recordedJuz } = useGetPagingMilestones(
		{
			page: 1,
			limit: JUZ_COUNT,
			studentId: form.values.studentId,
			type: 'JUZ',
		},
		{ enabled: Boolean(form.values.studentId) },
	);

	const juzOptions = useMemo(() => {
		const taken = new Set(
			recordedJuz?.data
				.filter((item) => item.id !== milestone?.id)
				.map((item) => String(item.juzNumber)),
		);

		return JUZ_OPTIONS.map((option) => ({
			...option,
			label: taken.has(option.value)
				? `${option.label} (already recorded)`
				: option.label,
			disabled: taken.has(option.value),
		}));
	}, [recordedJuz, milestone?.id]);

	const studentOptions = useMemo(
		() =>
			students?.data.map((student) => ({
				value: student.id,
				label: `${student.firstName} ${student.lastName} (${student.family?.name})`,
			})) || [],
		[students],
	);

	const handleSubmit = async (values: FormValue) => {
		const payload: CreateMilestonePayload = {
			studentId: values.studentId,
			type: values.type,
			juzNumber: values.type === 'JUZ' ? Number(values.juzNumber) : null,
			bookName: values.type === 'BOOK' ? values.bookName.trim() : null,
			completedAt: dayjs(values.completedAt).format('YYYY-MM-DD'),
			notes: values.notes || null,
		};

		if (isEdit && milestone) {
			await updateMilestone({ id: milestone.id, data: payload });
		} else {
			await createMilestone(payload);
		}

		notifications.show({
			title: isEdit ? 'Milestone updated' : 'Milestone recorded',
			message: 'Saved successfully',
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
						label="Student"
						placeholder="Search student"
						searchable
						withAsterisk
						data={studentOptions}
						{...form.getInputProps('studentId')}
					/>

					<SegmentedControl
						fullWidth
						data={MILESTONE_TYPE_OPTIONS}
						{...form.getInputProps('type')}
					/>

					<Grid>
						<Grid.Col span={{ base: 12, md: 7 }}>
							{form.values.type === 'JUZ' ? (
								<Select
									label="Juz"
									placeholder="Select Juz"
									withAsterisk
									searchable
									data={juzOptions}
									{...form.getInputProps('juzNumber')}
								/>
							) : (
								<Autocomplete
									label="Book"
									placeholder="e.g. Qaida Nooraniyah"
									withAsterisk
									data={bookNames || []}
									{...form.getInputProps('bookName')}
								/>
							)}
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 5 }}>
							<DateInput
								label="Completed on"
								withAsterisk
								valueFormat="MM/DD/YYYY"
								{...form.getInputProps('completedAt')}
								onChange={(value) =>
									form.setFieldValue(
										'completedAt',
										(value as Date | null) || null,
									)
								}
							/>
						</Grid.Col>
					</Grid>

					<Textarea
						label="Notes"
						placeholder="Optional"
						minRows={2}
						{...form.getInputProps('notes')}
					/>

					<ModalFooter>
						<Button variant="default" onClick={() => modals.closeAll()}>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							{isEdit ? 'Update Milestone' : 'Record Milestone'}
						</Button>
					</ModalFooter>
				</Stack>
			</form>
		</Stack>
	);
};
