'use client';

import { useParams } from 'next/navigation';

import { useMemo, useState } from 'react';

import {
	ActionIcon,
	Alert,
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

import { IconAlertCircle, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	CreateTimeEntryPayload,
	UpdateTimeEntryPayload,
} from '@app/api/time-entries/types';

import PageHeader from '@components/PageHeader';

import { PAY_PERIOD_STATUS_COLORS, PAY_PERIOD_STATUS_LABELS } from '@configs/enums';
import { PATH_DASHBOARD, PATH_FINANCE } from '@configs/routes';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';
import { useGeneratePay } from '@hooks/react-query/pay-periods/useGeneratePay';
import { useGetPayPeriod } from '@hooks/react-query/pay-periods/useGetPayPeriod';
import { useGetSubmissions } from '@hooks/react-query/pay-periods/useGetSubmissions';
import { useUpdatePayPeriod } from '@hooks/react-query/pay-periods/useUpdatePayPeriod';
import { useGetPagingPayRecords } from '@hooks/react-query/pay-records/useGetPagingPayRecords';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';
import { useCreateTimeEntry } from '@hooks/react-query/time-entries/useCreateTimeEntry';
import { useDeleteTimeEntry } from '@hooks/react-query/time-entries/useDeleteTimeEntry';
import {
	StaffTimeEntryRow,
	useGetPagingTimeEntries,
} from '@hooks/react-query/time-entries/useGetPagingTimeEntries';
import { useUpdateTimeEntry } from '@hooks/react-query/time-entries/useUpdateTimeEntry';

import { formatMoney } from '@utils/money';

type TimeEntryFormValues = {
	teacherId: string;
	classId: string;
	date: Date | null;
	hours: number;
	notes: string;
};

const normalizeDate = (value: Date) => {
	const date = new Date(value);
	date.setHours(0, 0, 0, 0);
	return date;
};

export default function PayPeriodDetailPage() {
	const params = useParams<{ id: string }>();
	const payPeriodId = params.id;

	const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
	const [formOpened, setFormOpened] = useState(false);
	const [editingEntry, setEditingEntry] = useState<StaffTimeEntryRow | null>(null);
	const [submitError, setSubmitError] = useState('');

	const { data: payPeriod, isLoading: isLoadingPayPeriod } = useGetPayPeriod(payPeriodId);
	const { data: submissions, isLoading: isLoadingSubmissions } =
		useGetSubmissions(payPeriodId);

	const { data: timeEntriesResult, isLoading: isLoadingEntries } =
		useGetPagingTimeEntries({
			page: 1,
			limit: 500,
			payPeriodId,
			teacherId: teacherFilter || undefined,
		});

	const { data: payRecordsResult, isLoading: isLoadingPayRecords } =
		useGetPagingPayRecords({
			page: 1,
			limit: 500,
			payPeriodId,
		});

	const { data: teachers } = useGetPagingTeachers({
		page: 1,
		limit: 500,
		status: 'ACTIVE',
	});

	const form = useForm<TimeEntryFormValues>({
		initialValues: {
			teacherId: '',
			classId: '',
			date: null,
			hours: 0.25,
			notes: '',
		},
		validate: {
			teacherId: (value) => (value ? null : 'Teacher is required'),
			classId: (value) => (value ? null : 'Class is required'),
			date: (value) => (value ? null : 'Date is required'),
			hours: (value) => (value >= 0.25 && value <= 24 ? null : 'Hours must be 0.25 to 24'),
		},
	});

	const formTeacherId = editingEntry?.teacherId || form.values.teacherId;

	const { data: classes } = useGetPagingClasses({
		page: 1,
		limit: 200,
		teacherId: formTeacherId || '__none__',
		status: 'ACTIVE',
	});

	const { mutateAsync: createTimeEntry, isPending: isCreatingEntry } = useCreateTimeEntry();
	const { mutateAsync: updateTimeEntry, isPending: isUpdatingEntry } = useUpdateTimeEntry();
	const { mutateAsync: deleteTimeEntry, isPending: isDeletingEntry } = useDeleteTimeEntry();

	const { mutateAsync: generatePay, isPending: isGenerating } = useGeneratePay();
	const { mutateAsync: updatePayPeriod, isPending: isUpdatingPayPeriod } =
		useUpdatePayPeriod();

	const breadcrumbItems = [
		{ title: 'Dashboard', href: PATH_DASHBOARD.default },
		{ title: 'Finance', href: PATH_FINANCE.root },
		{ title: 'Pay Periods', href: PATH_FINANCE.payPeriods },
		{ title: payPeriod?.name || 'Detail', href: `${PATH_FINANCE.payPeriods}/${payPeriodId}` },
	].map((item, index) => (
		<Anchor key={index} href={item.href}>
			{item.title}
		</Anchor>
	));

	const timeEntries = timeEntriesResult?.data || [];
	const totalTimeEntryHours = timeEntries.reduce((sum, item) => sum + item.hours, 0);
	const payRecords = payRecordsResult?.data || [];

	const canEditPeriod = payPeriod?.status === 'OPEN';
	const canMarkAsPaid = payPeriod?.status === 'LOCKED';

	const teacherOptions = useMemo(
		() =>
			teachers?.data
				.filter((teacher) => teacher._count.classes > 0)
				.map((teacher) => ({
					value: teacher.id,
					label: `${teacher.firstName} ${teacher.lastName}`,
				})) || [],
		[teachers],
	);

	const classOptions =
		classes?.data.map((classItem) => ({
			value: classItem.id,
			label: `${classItem.name} (${classItem.program.name})`,
		})) || [];

	const resetFormState = () => {
		setEditingEntry(null);
		setSubmitError('');
		form.reset();
	};

	const openCreateModal = () => {
		if (!canEditPeriod) {
			return;
		}

		resetFormState();
		setFormOpened(true);
	};

	const openEditModal = (entry: StaffTimeEntryRow) => {
		if (!canEditPeriod) {
			return;
		}

		setEditingEntry(entry);
		setSubmitError('');
		form.setValues({
			teacherId: entry.teacherId,
			classId: entry.classId,
			date: new Date(entry.date),
			hours: entry.hours,
			notes: entry.notes || '',
		});
		setFormOpened(true);
	};

	const handleDeleteEntry = (entry: StaffTimeEntryRow) => {
		modals.openConfirmModal({
			title: 'Delete entry?',
			children: 'This will permanently remove the time entry.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteTimeEntry(entry.id);
					notifications.show({
						title: 'Deleted',
						message: 'Time entry deleted successfully',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: 'Delete failed',
						message: error instanceof Error ? error.message : 'Unexpected error',
						color: 'red',
					});
				}
			},
		});
	};

	const handleGeneratePay = () => {
		modals.openConfirmModal({
			title: 'Generate pay?',
			children:
				'This will lock the period and calculate pay for all teachers. This action cannot be undone. Continue?',
			labels: { confirm: 'Generate', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					await generatePay({ payPeriodId });
					notifications.show({
						title: 'Generated',
						message: 'Pay has been generated and period is now locked',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: 'Generate failed',
						message: error instanceof Error ? error.message : 'Unexpected error',
						color: 'red',
					});
				}
			},
		});
	};

	const handleMarkAsPaid = () => {
		modals.openConfirmModal({
			title: 'Mark as paid?',
			children: 'This will mark the pay period as PAID.',
			labels: { confirm: 'Mark as Paid', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					await updatePayPeriod({ id: payPeriodId, data: { status: 'PAID' } });
					notifications.show({
						title: 'Updated',
						message: 'Pay period is now marked as paid',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: 'Update failed',
						message: error instanceof Error ? error.message : 'Unexpected error',
						color: 'red',
					});
				}
			},
		});
	};

	const handleSubmitTimeEntry = async (values: TimeEntryFormValues) => {
		try {
			setSubmitError('');

			if (!payPeriod) {
				return;
			}

			if (!values.date) {
				setSubmitError('Date is required');
				return;
			}

			const entryDate = normalizeDate(values.date);
			const startDate = normalizeDate(new Date(payPeriod.startDate));
			const endDate = normalizeDate(new Date(payPeriod.endDate));

			if (entryDate < startDate || entryDate > endDate) {
				setSubmitError('Date must be within pay period range');
				return;
			}

			if (editingEntry) {
				const payload: UpdateTimeEntryPayload = {
					classId: values.classId,
					date: values.date,
					hours: values.hours,
					notes: values.notes || undefined,
				};
				await updateTimeEntry({ id: editingEntry.id, data: payload });
				notifications.show({
					title: 'Updated',
					message: 'Time entry updated successfully',
					color: 'green',
				});
			} else {
				const payload: CreateTimeEntryPayload = {
					teacherId: values.teacherId,
					classId: values.classId,
					payPeriodId,
					date: values.date,
					hours: values.hours,
					notes: values.notes || undefined,
				};
				await createTimeEntry(payload);
				notifications.show({
					title: 'Created',
					message: 'Time entry created successfully',
					color: 'green',
				});
			}

			setFormOpened(false);
			resetFormState();
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : 'Unexpected error');
		}
	};

	if (isLoadingPayPeriod || !payPeriod) {
		return (
			<Container fluid>
				<Center h={260}>
					<Loader />
				</Center>
			</Container>
		);
	}

	return (
		<>
			<title>{payPeriod.name} | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader title={payPeriod.name} breadcrumbItems={breadcrumbItems} />

					<Group justify="space-between" wrap="wrap">
						<Group gap="sm" wrap="wrap">
							<Badge color={PAY_PERIOD_STATUS_COLORS[payPeriod.status]} variant="light">
								{PAY_PERIOD_STATUS_LABELS[payPeriod.status]}
							</Badge>
							<Text c="dimmed">
								{dayjs(payPeriod.startDate).format('MM/DD/YYYY')} – {dayjs(payPeriod.endDate).format('MM/DD/YYYY')}
							</Text>
						</Group>

						<Group>
							{canEditPeriod && (
								<Button onClick={handleGeneratePay} loading={isGenerating} color="orange">
									Generate Pay
								</Button>
							)}
							{canMarkAsPaid && (
								<Button onClick={handleMarkAsPaid} loading={isUpdatingPayPeriod} color="teal">
									Mark as Paid
								</Button>
							)}
						</Group>
					</Group>

					<Paper withBorder p="md">
						<Group justify="space-between" mb="sm">
							<Text fw={700}>Submissions Overview</Text>
							<Text size="sm" c="dimmed">
								{submissions?.filter((item) => item.submitted).length || 0} / {submissions?.length || 0} submitted
							</Text>
						</Group>

						{isLoadingSubmissions ? (
							<Center h={120}>
								<Loader size="sm" />
							</Center>
						) : (
							<Table withTableBorder withColumnBorders>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>#</Table.Th>
										<Table.Th>Teacher</Table.Th>
										<Table.Th ta="center">Classes</Table.Th>
										<Table.Th ta="right">Total Hours</Table.Th>
										<Table.Th>Status</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{submissions?.map((item, index) => (
										<Table.Tr key={item.teacherId}>
											<Table.Td>{index + 1}</Table.Td>
											<Table.Td>{item.teacherName}</Table.Td>
											<Table.Td ta="center">{item.classCount}</Table.Td>
											<Table.Td ta="right">{item.totalHours.toFixed(2)}</Table.Td>
											<Table.Td>
												<Badge color={item.submitted ? 'green' : 'yellow'} variant="light">
													{item.submitted ? 'Submitted' : 'Pending'}
												</Badge>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						)}
					</Paper>

					<Paper withBorder p="md">
						<Group justify="space-between" mb="sm" wrap="wrap">
							<Text fw={700}>Time Entries</Text>
							<Group>
								<Select
									placeholder="Filter by teacher"
									clearable
									searchable
									w={260}
									data={teacherOptions}
									value={teacherFilter}
									onChange={setTeacherFilter}
								/>
								{canEditPeriod && (
									<Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
										Add Entry
									</Button>
								)}
							</Group>
						</Group>

						{isLoadingEntries ? (
							<Center h={120}>
								<Loader size="sm" />
							</Center>
						) : (
							<Table withTableBorder withColumnBorders>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>#</Table.Th>
										<Table.Th>Teacher</Table.Th>
										<Table.Th>Date</Table.Th>
										<Table.Th>Class</Table.Th>
										<Table.Th ta="right">Hours</Table.Th>
										<Table.Th>Notes</Table.Th>
										<Table.Th ta="center">Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{timeEntries.map((entry, index) => (
										<Table.Tr key={entry.id}>
											<Table.Td>{index + 1}</Table.Td>
											<Table.Td>{`${entry.teacher.firstName} ${entry.teacher.lastName}`}</Table.Td>
											<Table.Td>{dayjs(entry.date).format('MM/DD/YYYY')}</Table.Td>
											<Table.Td>{entry.class.name}</Table.Td>
											<Table.Td ta="right">{entry.hours.toFixed(2)}</Table.Td>
											<Table.Td>{entry.notes || '—'}</Table.Td>
											<Table.Td>
												<Group justify="center" gap={8} wrap="nowrap">
													{canEditPeriod ? (
														<>
															<ActionIcon
																variant="subtle"
																color="yellow"
																onClick={() => openEditModal(entry)}
															>
																<IconEdit size={16} />
															</ActionIcon>
															<ActionIcon
																variant="subtle"
																color="red"
																onClick={() => handleDeleteEntry(entry)}
																disabled={isDeletingEntry}
															>
																<IconTrash size={16} />
															</ActionIcon>
														</>
													) : (
														<Text c="dimmed" size="sm">
															—
														</Text>
													)}
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
								<Table.Tfoot>
									<Table.Tr>
										<Table.Td colSpan={4} fw={700}>
											Total
										</Table.Td>
										<Table.Td ta="right" fw={700}>
											{totalTimeEntryHours.toFixed(2)}
										</Table.Td>
										<Table.Td colSpan={2} />
									</Table.Tr>
								</Table.Tfoot>
							</Table>
						)}
					</Paper>

					{payPeriod.status !== 'OPEN' && (
						<Paper withBorder p="md">
							<Text fw={700} mb="sm">
								Pay Report
							</Text>

							{isLoadingPayRecords ? (
								<Center h={120}>
									<Loader size="sm" />
								</Center>
							) : (
								<Table withTableBorder withColumnBorders>
									<Table.Thead>
										<Table.Tr>
											<Table.Th>#</Table.Th>
											<Table.Th>Teacher</Table.Th>
											<Table.Th ta="right">Total Hours</Table.Th>
											<Table.Th ta="right">Rate</Table.Th>
											<Table.Th ta="right">Total Pay</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{payRecords.map((record, index) => (
											<Table.Tr key={record.id}>
												<Table.Td>{index + 1}</Table.Td>
												<Table.Td>{`${record.teacher.firstName} ${record.teacher.lastName}`}</Table.Td>
												<Table.Td ta="right">{record.totalHours.toFixed(2)}</Table.Td>
												<Table.Td ta="right">{formatMoney(record.hourlyRate)}</Table.Td>
												<Table.Td ta="right">{formatMoney(record.totalPay)}</Table.Td>
											</Table.Tr>
										))}
									</Table.Tbody>
									<Table.Tfoot>
										<Table.Tr>
											<Table.Td colSpan={2} fw={700}>
												TOTAL
											</Table.Td>
											<Table.Td ta="right" fw={700}>
												{(payRecordsResult?.summary.totalHours || 0).toFixed(2)}
											</Table.Td>
											<Table.Td ta="right">—</Table.Td>
											<Table.Td ta="right" fw={700}>
												{formatMoney(payRecordsResult?.summary.totalPay || 0)}
											</Table.Td>
										</Table.Tr>
									</Table.Tfoot>
								</Table>
							)}
						</Paper>
					)}
				</Stack>
			</Container>

			<Modal
				opened={formOpened}
				onClose={() => {
					setFormOpened(false);
					resetFormState();
				}}
				title={editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
				size="lg"
			>
				<Stack>
					{submitError && (
						<Alert color="red" icon={<IconAlertCircle size={16} />}>
							{submitError}
						</Alert>
					)}

					<form onSubmit={form.onSubmit(handleSubmitTimeEntry)}>
						<Stack>
							<Select
								label="Teacher"
								withAsterisk
								searchable
								placeholder="Select teacher"
								data={teacherOptions}
								disabled={Boolean(editingEntry)}
								value={form.values.teacherId || null}
								onChange={(value) => {
									form.setFieldValue('teacherId', value || '');
									form.setFieldValue('classId', '');
								}}
								error={form.errors.teacherId}
							/>

							<Select
								label="Class"
								withAsterisk
								searchable
								placeholder="Select class"
								data={classOptions}
								disabled={!formTeacherId}
								value={form.values.classId || null}
								onChange={(value) => form.setFieldValue('classId', value || '')}
								error={form.errors.classId}
							/>

							<DateInput
								label="Date"
								withAsterisk
								valueFormat="MM/DD/YYYY"
								{...form.getInputProps('date')}
							/>

							<NumberInput
								label="Hours"
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
								placeholder="Optional note"
								minRows={2}
								{...form.getInputProps('notes')}
							/>

							<Group justify="flex-end">
								<Button
									variant="default"
									onClick={() => {
										setFormOpened(false);
										resetFormState();
									}}
								>
									Cancel
								</Button>
								<Button type="submit" loading={isCreatingEntry || isUpdatingEntry}>
									{editingEntry ? 'Update Entry' : 'Add Entry'}
								</Button>
							</Group>
						</Stack>
					</form>
				</Stack>
			</Modal>
		</>
	);
}
