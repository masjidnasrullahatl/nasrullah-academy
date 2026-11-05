import { useMemo } from 'react';

import {
	Alert,
	Button,
	Grid,
	NumberInput,
	Select,
	Stack,
	Textarea,
	TextInput,
} from '@mantine/core';
import { DateInput, MonthPickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { ModalFooter } from '@components/ModalFooter';

import {
	ScholarshipRow,
	useSaveScholarship,
} from '@hooks/react-query/scholarships/useScholarships';
import { useGetPagingStudents } from '@hooks/react-query/students/useGetPagingStudents';

type Props = {
	scholarship?: ScholarshipRow;
};

type FormValue = {
	studentId: string;
	donorName: string;
	amountReceived: number | string;
	receivedAt: Date | null;
	startMonth: Date | null;
	endMonth: Date | null;
	notes: string;
};

// Dates are stored as calendar days; read only the YYYY-MM-DD part
const toDate = (value?: string | null) =>
	value ? dayjs(value.slice(0, 10)).toDate() : null;

const toDay = (value: Date | string | null) =>
	value ? dayjs(value).format('YYYY-MM-DD') : null;

const toMonth = (value: Date | string | null) =>
	value ? dayjs(value).startOf('month').format('YYYY-MM-DD') : null;

export const ScholarshipFormModal = ({ scholarship }: Props) => {
	const { data: students } = useGetPagingStudents({ page: 1, limit: 1000 });
	const { mutateAsync, isPending, error } = useSaveScholarship();

	const form = useForm<FormValue>({
		initialValues: {
			studentId: scholarship?.studentId || '',
			donorName: scholarship?.donorName || '',
			amountReceived: scholarship?.amountReceived ?? '',
			receivedAt: toDate(scholarship?.receivedAt),
			startMonth: toDate(scholarship?.startMonth),
			endMonth: toDate(scholarship?.endMonth),
			notes: scholarship?.notes || '',
		},
		validate: {
			studentId: (value) => (value ? null : 'Student is required'),
			amountReceived: (value) =>
				Number(value) > 0 ? null : 'Enter the amount received',
			receivedAt: (value) => (value ? null : 'Date received is required'),
			startMonth: (value) => (value ? null : 'First month is required'),
			endMonth: (value, values) => {
				if (!value) return 'Last month is required';

				return values.startMonth &&
					dayjs(value).isBefore(dayjs(values.startMonth), 'month')
					? 'Last month cannot be before the first month'
					: null;
			},
		},
	});

	const studentOptions = useMemo(
		() =>
			students?.data.map((student) => ({
				value: student.id,
				label: `${student.firstName} ${student.lastName} (${student.family?.name})`,
			})) || [],
		[students],
	);

	const handleSubmit = async (values: FormValue) => {
		await mutateAsync({
			id: scholarship?.id,
			data: {
				studentId: values.studentId,
				donorName: values.donorName || null,
				amountReceived: Number(values.amountReceived),
				receivedAt: toDay(values.receivedAt) as string,
				startMonth: toMonth(values.startMonth) as string,
				endMonth: toMonth(values.endMonth) as string,
				notes: values.notes || null,
			},
		});

		notifications.show({
			title: 'Scholarship saved',
			message: 'The scholarship was saved successfully',
			color: 'green',
		});
		modals.closeAll();
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack>
				{error && (
					<Alert color="red" icon={<IconAlertCircle size={16} />}>
						{error.message}
					</Alert>
				)}

				<Select
					label="Student"
					placeholder="Select student"
					searchable
					withAsterisk
					data={studentOptions}
					{...form.getInputProps('studentId')}
				/>

				<TextInput
					label="Paid by"
					description="Who gave the money. Leave empty if anonymous."
					{...form.getInputProps('donorName')}
				/>

				<Grid>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<NumberInput
							label="Amount received"
							prefix="$"
							min={0}
							decimalScale={2}
							withAsterisk
							{...form.getInputProps('amountReceived')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<DateInput
							label="Date received"
							description="The money counts in this month's totals"
							valueFormat="MM/DD/YYYY"
							withAsterisk
							{...form.getInputProps('receivedAt')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<MonthPickerInput
							label="First month"
							valueFormat="MMMM YYYY"
							withAsterisk
							{...form.getInputProps('startMonth')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<MonthPickerInput
							label="Last month"
							description="Same as the first month for a one-month payment"
							valueFormat="MMMM YYYY"
							withAsterisk
							{...form.getInputProps('endMonth')}
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
						{scholarship ? 'Update Scholarship' : 'Add Scholarship'}
					</Button>
				</ModalFooter>
			</Stack>
		</form>
	);
};
