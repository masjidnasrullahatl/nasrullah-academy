import { Button, NumberInput, Select, Stack, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import {
	CreateTimeEntryPayload,
	UpdateTimeEntryPayload,
} from '@app/api/teacher/me/time-entries/types';

import { ModalFooter } from '@components/ModalFooter';

import { useCreateMyTimeEntry } from '@hooks/react-query/teacher/useCreateMyTimeEntry';
import { MyClassRow } from '@hooks/react-query/teacher/useGetMyClasses';
import { MyTimeEntry } from '@hooks/react-query/teacher/useGetMyTimeEntries';
import { TeacherPayPeriod } from '@hooks/react-query/teacher/useGetTeacherPayPeriods';
import { useUpdateMyTimeEntry } from '@hooks/react-query/teacher/useUpdateMyTimeEntry';

type Props = {
	selectedPeriod: TeacherPayPeriod;
	classes: MyClassRow[];
	entry?: MyTimeEntry;
};

type FormValues = {
	date: Date | null;
	classId: string;
	hours: number;
	notes: string;
};

export const TimeEntryFormModal = ({
	selectedPeriod,
	classes,
	entry,
}: Props) => {
	const isEdit = Boolean(entry?.id);

	const { mutateAsync: createEntry, isPending: isCreating } =
		useCreateMyTimeEntry();
	const { mutateAsync: updateEntry, isPending: isUpdating } =
		useUpdateMyTimeEntry();

	const form = useForm<FormValues>({
		initialValues: {
			date: entry ? new Date(entry.date) : null,
			classId: entry?.class.id || '',
			hours: entry?.hours ?? 0.25,
			notes: entry?.notes || '',
		},
	});

	const handleSubmit = async (values: FormValues) => {
		if (!values.date) {
			form.setFieldError('date', 'Date is required');
			return;
		}

		if (!values.classId) {
			form.setFieldError('classId', 'Class is required');
			return;
		}

		if (isEdit && entry) {
			const payload: UpdateTimeEntryPayload = {
				date: values.date,
				classId: values.classId,
				hours: values.hours,
				notes: values.notes || undefined,
			};

			await updateEntry({ id: entry.id, data: payload });
			notifications.show({
				title: 'Entry updated',
				message: 'Time entry updated successfully',
				color: 'green',
			});
		} else {
			const payload: CreateTimeEntryPayload = {
				date: values.date,
				classId: values.classId,
				hours: values.hours,
				payPeriodId: selectedPeriod.id,
				notes: values.notes || undefined,
			};

			await createEntry(payload);
			notifications.show({
				title: 'Entry added',
				message: 'Time entry created successfully',
				color: 'green',
			});
		}

		modals.closeAll();
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<Stack>
				<DateInput
					label="Date"
					placeholder="Select date"
					withAsterisk
					minDate={new Date(selectedPeriod.startDate)}
					maxDate={new Date(selectedPeriod.endDate)}
					value={form.values.date}
					onChange={(value) =>
						form.setFieldValue(
							'date',
							typeof value === 'string' ? new Date(value) : value,
						)
					}
					error={form.errors.date}
				/>

				<Select
					label="Class"
					placeholder="Select class"
					withAsterisk
					searchable
					data={classes.map((classItem) => ({
						value: classItem.id,
						label: classItem.name,
					}))}
					{...form.getInputProps('classId')}
				/>

				<NumberInput
					label="Hours"
					placeholder="0.25"
					withAsterisk
					min={0.25}
					max={24}
					step={0.25}
					decimalScale={2}
					fixedDecimalScale
					{...form.getInputProps('hours')}
				/>

				<Textarea
					label="Notes"
					placeholder="Optional notes"
					autosize
					minRows={3}
					{...form.getInputProps('notes')}
				/>

				<ModalFooter>
					<Button variant="default" onClick={() => modals.closeAll()}>
						Cancel
					</Button>
					<Button type="submit" loading={isCreating || isUpdating}>
						{isEdit ? 'Update Entry' : 'Create Entry'}
					</Button>
				</ModalFooter>
			</Stack>
		</form>
	);
};
