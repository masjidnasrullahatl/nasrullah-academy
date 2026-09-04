'use client';

import { useEffect, useMemo, useState } from 'react';

import {
	ActionIcon,
	Anchor,
	Badge,
	Button,
	Center,
	Container,
	Group,
	Loader,
	Modal,
	NumberInput,
	Paper,
	Select,
	Stack,
	Table,
	Text,
	Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	CreateTimeEntryPayload,
	UpdateTimeEntryPayload,
} from '@app/api/teacher/me/time-entries/types';

import PageHeader from '@components/PageHeader';

import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import { useCreateMyTimeEntry } from '@hooks/react-query/teacher/useCreateMyTimeEntry';
import { useDeleteMyTimeEntry } from '@hooks/react-query/teacher/useDeleteMyTimeEntry';
import { useGetMyClasses } from '@hooks/react-query/teacher/useGetMyClasses';
import {
	MyTimeEntry,
	useGetMyTimeEntries,
} from '@hooks/react-query/teacher/useGetMyTimeEntries';
import { useGetTeacherPayPeriods } from '@hooks/react-query/teacher/useGetTeacherPayPeriods';
import { useSubmitMyHours } from '@hooks/react-query/teacher/useSubmitMyHours';
import { useUpdateMyTimeEntry } from '@hooks/react-query/teacher/useUpdateMyTimeEntry';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'Time Entry', href: PATH_TEACHER_APPS.timeEntries },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

type FormValues = {
	date: Date | null;
	classId: string;
	hours: number;
	notes: string;
};

const getStatusBadge = (
	periodStatus: 'OPEN' | 'LOCKED' | 'PAID',
	submittedAt: string | null,
) => {
	if (periodStatus === 'PAID') {
		return <Badge color="teal">Paid</Badge>;
	}

	if (periodStatus === 'LOCKED') {
		return <Badge color="orange">Locked — pay generated</Badge>;
	}

	if (submittedAt) {
		return (
			<Badge color="green">Submitted on {dayjs(submittedAt).format('MM/DD/YYYY')}</Badge>
		);
	}

	return <Badge color="blue">Open</Badge>;
};

export default function TeacherTimeEntriesPage() {
	const { data: periods, isLoading: isLoadingPeriods } = useGetTeacherPayPeriods();
	const { data: classes, isLoading: isLoadingClasses } = useGetMyClasses();

	const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string | null>(null);
	const [opened, setOpened] = useState(false);
	const [editingEntry, setEditingEntry] = useState<MyTimeEntry | null>(null);

	const {
		data: entryResult,
		isLoading: isLoadingEntries,
	} = useGetMyTimeEntries(selectedPayPeriodId || undefined);

	const { mutateAsync: createEntry, isPending: isCreating } = useCreateMyTimeEntry();
	const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateMyTimeEntry();
	const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteMyTimeEntry();
	const { mutateAsync: submitHours, isPending: isSubmitting } = useSubmitMyHours();

	const selectedPeriod = useMemo(
		() => periods?.find((period) => period.id === selectedPayPeriodId) || null,
		[periods, selectedPayPeriodId],
	);

	useEffect(() => {
		if (!periods?.length || selectedPayPeriodId) {
			return;
		}

		const today = dayjs();
		const currentOpen = periods.find(
			(period) =>
				period.status === 'OPEN' &&
				!today.isBefore(dayjs(period.startDate).startOf('day')) &&
				!today.isAfter(dayjs(period.endDate).endOf('day')),
		);

		setSelectedPayPeriodId(currentOpen?.id || periods[0].id);
	}, [periods, selectedPayPeriodId]);

	const submittedAt = entryResult?.submittedAt || null;
	const entries = entryResult?.data || [];
	const totalHours = entries.reduce((sum, item) => sum + item.hours, 0);

	const canManageEntries = Boolean(
		selectedPeriod?.status === 'OPEN' && !submittedAt,
	);

	const canSubmitHours = Boolean(
		selectedPeriod?.status === 'OPEN' && !submittedAt && entries.length,
	);

	const form = useForm<FormValues>({
		initialValues: {
			date: null,
			classId: '',
			hours: 0.25,
			notes: '',
		},
	});

	const resetFormModal = () => {
		setEditingEntry(null);
		form.reset();
	};

	const openCreateModal = () => {
		if (!canManageEntries) {
			return;
		}

		resetFormModal();
		setOpened(true);
	};

	const openEditModal = (entry: MyTimeEntry) => {
		if (!canManageEntries) {
			return;
		}

		setEditingEntry(entry);
		form.setValues({
			date: new Date(entry.date),
			classId: entry.class.id,
			hours: entry.hours,
			notes: entry.notes || '',
		});
		setOpened(true);
	};

	const handleSaveEntry = async (values: FormValues) => {
		if (!selectedPeriod) {
			return;
		}

		if (!values.date) {
			form.setFieldError('date', 'Date is required');
			return;
		}

		if (!values.classId) {
			form.setFieldError('classId', 'Class is required');
			return;
		}

		if (editingEntry) {
			const payload: UpdateTimeEntryPayload = {
				date: values.date,
				classId: values.classId,
				hours: values.hours,
				notes: values.notes || undefined,
			};

			await updateEntry({ id: editingEntry.id, data: payload });
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

		setOpened(false);
		resetFormModal();
	};

	const handleDelete = (entry: MyTimeEntry) => {
		modals.openConfirmModal({
			title: 'Delete entry?',
			children: 'This will remove the time entry permanently.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteEntry(entry.id);
				notifications.show({
					title: 'Entry deleted',
					message: 'Time entry deleted successfully',
					color: 'green',
				});
			},
		});
	};

	const handleSubmitHours = () => {
		if (!selectedPayPeriodId) {
			return;
		}

		modals.openConfirmModal({
			title: 'Submit hours?',
			children:
				'Once submitted, you cannot edit these entries. Staff can still make corrections. Continue?',
			labels: { confirm: 'Submit', cancel: 'Cancel' },
			onConfirm: async () => {
				await submitHours(selectedPayPeriodId);
				notifications.show({
					title: 'Hours submitted',
					message: 'Your time entries were submitted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
		<Container fluid>
			<Stack>
				<title>Time Entry | Nasrullah Academy</title>
				<PageHeader title="Time Entry" breadcrumbItems={items} />

				<Paper withBorder p="md">
					<Group justify="space-between" mb="md" wrap="wrap">
						<Group>
							<Select
								label="Pay Period"
								placeholder="Select pay period"
								w={280}
								data={(periods || []).map((period) => ({
									value: period.id,
									label: period.name,
								}))}
								value={selectedPayPeriodId}
								onChange={setSelectedPayPeriodId}
							/>
							{selectedPeriod && getStatusBadge(selectedPeriod.status, submittedAt)}
						</Group>

						<Group>
							{canManageEntries && (
								<Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
									Add Entry
								</Button>
							)}
							{canSubmitHours && (
								<Button loading={isSubmitting} onClick={handleSubmitHours}>
									Submit Hours
								</Button>
							)}
						</Group>
					</Group>

					{isLoadingPeriods || isLoadingEntries || isLoadingClasses ? (
						<Center h={260}>
							<Loader />
						</Center>
					) : entries.length ? (
						<>
							<Table withTableBorder withColumnBorders striped="even">
								<Table.Thead>
									<Table.Tr>
										<Table.Th>#</Table.Th>
										<Table.Th>Date</Table.Th>
										<Table.Th>Class</Table.Th>
										<Table.Th>Hours</Table.Th>
										<Table.Th>Notes</Table.Th>
										<Table.Th ta="center">Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{entries.map((entry, index) => (
										<Table.Tr key={entry.id}>
											<Table.Td>{index + 1}</Table.Td>
											<Table.Td>{dayjs(entry.date).format('MM/DD/YYYY')}</Table.Td>
											<Table.Td>{entry.class.name}</Table.Td>
											<Table.Td>{entry.hours.toFixed(2)}</Table.Td>
											<Table.Td>{entry.notes || '-'}</Table.Td>
											<Table.Td ta="center">
												<Group justify="center" gap="xs">
													<ActionIcon
														variant="subtle"
														onClick={() => openEditModal(entry)}
														disabled={!canManageEntries || isUpdating}
													>
														<IconEdit size={16} />
													</ActionIcon>
													<ActionIcon
														variant="subtle"
														color="red"
														onClick={() => handleDelete(entry)}
														disabled={!canManageEntries || isDeleting}
													>
														<IconTrash size={16} />
													</ActionIcon>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
							<Group justify="space-between" mt="md">
								<Text fw={700}>Total hours: {totalHours.toFixed(2)}</Text>
							</Group>
						</>
					) : (
						<Center h={220}>
							<Text c="dimmed">No time entries found for this pay period</Text>
						</Center>
					)}
				</Paper>
			</Stack>

			<Modal
				opened={opened}
				onClose={() => {
					setOpened(false);
					resetFormModal();
				}}
				title={editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
				size="md"
			>
				<form onSubmit={form.onSubmit(handleSaveEntry)}>
					<Stack>
						<DateInput
							label="Date"
							placeholder="Select date"
							withAsterisk
							minDate={
								selectedPeriod ? new Date(selectedPeriod.startDate) : undefined
							}
							maxDate={
								selectedPeriod ? new Date(selectedPeriod.endDate) : undefined
							}
							value={form.values.date}
							onChange={(value) =>
								form.setFieldValue(
									'date',
									typeof value === 'string'
										? new Date(value)
										: value,
								)
							}
							error={form.errors.date}
						/>

						<Select
							label="Class"
							placeholder="Select class"
							withAsterisk
							searchable
							data={(classes || []).map((classItem) => ({
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

						<Group justify="flex-end">
							<Button
								variant="default"
								onClick={() => {
									setOpened(false);
									resetFormModal();
								}}
							>
								Cancel
							</Button>
							<Button type="submit" loading={isCreating || isUpdating}>
								{editingEntry ? 'Update Entry' : 'Create Entry'}
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>
		</Container>
	);
}
