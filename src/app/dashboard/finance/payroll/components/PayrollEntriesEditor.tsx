import { useEffect, useMemo, useState } from 'react';

import { ActionIcon, Alert, Badge, Button, Group, NumberInput, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { PAYROLL_STATUS_OPTIONS } from '@configs/enums';

import { useDeletePayrollEntry } from '@hooks/react-query/payroll/useDeletePayrollEntry';
import { PayrollEntryRow, PayrollPeriodRow } from '@hooks/react-query/payroll/useGetPagingPayrollPeriods';
import { useUpsertPayrollEntries } from '@hooks/react-query/payroll/useUpsertPayrollEntries';

import { formatMoney } from '@utils/money';
import { formatDecimal } from '@utils/number';

import { AddTeachersModal } from './AddTeachersModal';

type PayrollEntriesEditorProps = {
	period: PayrollPeriodRow;
};

type EditableEntry = {
	id: string;
	teacherId: string;
	teacherName: string;
	zelleId: string;
	hourlyRate: number;
	weekdayHours: number;
	weekendHours: number;
	weekdayPay: number;
	weekendPay: number;
	totalPay: number;
	payStatus: 'DRAFT' | 'PAID';
	notes: string;
};

const toEditableEntry = (entry: PayrollEntryRow): EditableEntry => {
	const weekdayPay = entry.weekdayHours * entry.hourlyRate;
	const weekendPay = entry.weekendHours * entry.hourlyRate;

	return {
		id: entry.id,
		teacherId: entry.teacherId,
		teacherName: `${entry.teacher.firstName} ${entry.teacher.lastName}`,
		zelleId: entry.teacher.zelleId || '-',
		hourlyRate: entry.hourlyRate,
		weekdayHours: entry.weekdayHours,
		weekendHours: entry.weekendHours,
		weekdayPay,
		weekendPay,
		totalPay: weekdayPay + weekendPay,
		payStatus: entry.payStatus,
		notes: entry.notes || '',
	};
};

const entriesFingerprint = (entries: EditableEntry[]) =>
	JSON.stringify(
		entries.map((entry) => ({
			id: entry.id,
			teacherId: entry.teacherId,
			hourlyRate: entry.hourlyRate,
			weekdayHours: entry.weekdayHours,
			weekendHours: entry.weekendHours,
			payStatus: entry.payStatus,
			notes: entry.notes,
		})),
	);

export const PayrollEntriesEditor = ({ period }: PayrollEntriesEditorProps) => {
	const [editableEntries, setEditableEntries] = useState<EditableEntry[]>([]);
	const [initialFingerprint, setInitialFingerprint] = useState('[]');

	const { mutateAsync: upsertEntries, isPending: isSaving } = useUpsertPayrollEntries();
	const { mutateAsync: deleteEntry, isPending: isDeletingEntry } = useDeletePayrollEntry();

	useEffect(() => {
		const mapped = period.entries.map(toEditableEntry);
		setEditableEntries(mapped);
		setInitialFingerprint(entriesFingerprint(mapped));
	}, [period]);

	const isLocked = period.status === 'PAID';
	const currentFingerprint = useMemo(() => entriesFingerprint(editableEntries), [editableEntries]);
	const isDirty = currentFingerprint !== initialFingerprint;

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!isDirty) {
				return;
			}

			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);

	const handleChangeEntry = (entryId: string, patch: Partial<EditableEntry>) => {
		setEditableEntries((previousEntries) =>
			previousEntries.map((entry) => {
				if (entry.id !== entryId) {
					return entry;
				}

				const next = { ...entry, ...patch };
				next.weekdayPay = next.weekdayHours * next.hourlyRate;
				next.weekendPay = next.weekendHours * next.hourlyRate;
				next.totalPay = next.weekdayPay + next.weekendPay;

				return next;
			}),
		);
	};

	const handleDeleteEntry = (entry: EditableEntry) => {
		modals.openConfirmModal({
			title: `Remove payroll entry for ${entry.teacherName}?`,
			children: 'This removes the selected teacher from this payroll period.',
			labels: { confirm: 'Remove', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteEntry({ periodId: period.id, entryId: entry.id });
				notifications.show({
					title: 'Entry removed',
					message: `${entry.teacherName} removed from period`,
					color: 'green',
				});
			},
		});
	};

	const handleSave = async () => {
		await upsertEntries({
			periodId: period.id,
			data: {
				entries: editableEntries.map((entry) => ({
					id: entry.id,
					teacherId: entry.teacherId,
					hourlyRate: entry.hourlyRate,
					weekdayHours: entry.weekdayHours,
					weekendHours: entry.weekendHours,
					payStatus: entry.payStatus,
					notes: entry.notes || null,
				})),
			},
		});

		setInitialFingerprint(entriesFingerprint(editableEntries));

		notifications.show({
			title: 'Payroll entries saved',
			message: 'All edited entries were saved in one batch',
			color: 'green',
		});
	};

	const totals = useMemo(
		() => ({
			weekdayHours: editableEntries.reduce((sum, entry) => sum + entry.weekdayHours, 0),
			weekendHours: editableEntries.reduce((sum, entry) => sum + entry.weekendHours, 0),
			weekdayPay: editableEntries.reduce((sum, entry) => sum + entry.weekdayPay, 0),
			weekendPay: editableEntries.reduce((sum, entry) => sum + entry.weekendPay, 0),
			totalPay: editableEntries.reduce((sum, entry) => sum + entry.totalPay, 0),
		}),
		[editableEntries],
	);

	return (
		<Stack>
			<Group justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Title order={4}>{period.label}</Title>
					<Text c="dimmed" size="sm">
						{dayjs(period.startDate).format('MM/DD/YYYY')} - {dayjs(period.endDate).format('MM/DD/YYYY')}
					</Text>
					<Badge color={period.status === 'PAID' ? 'green' : 'yellow'}>{period.status}</Badge>
				</Stack>
				<Group>
					<Button
						variant="default"
						leftSection={<IconPlus size={16} />}
						onClick={() =>
							modals.open({
								title: 'Add teachers',
								children: <AddTeachersModal period={period} />,
							})
						}
						disabled={isLocked}
					>
						Add teachers
					</Button>
					<Button onClick={handleSave} loading={isSaving} disabled={!isDirty || isLocked}>
						Save changes
					</Button>
				</Group>
			</Group>

			{isLocked && (
				<Alert color="yellow" icon={<IconAlertCircle size={16} />}>
					This payroll period is PAID and locked. Reopen to DRAFT to edit entries.
				</Alert>
			)}

			<Table.ScrollContainer minWidth={1700}>
				<Table bg="white" border={1}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>#</Table.Th>
							<Table.Th>Teacher</Table.Th>
							<Table.Th>Zelle ID</Table.Th>
							<Table.Th>Rate/h</Table.Th>
							<Table.Th>Weekday Hrs</Table.Th>
							<Table.Th>Weekend Hrs</Table.Th>
							<Table.Th>Weekday Pay</Table.Th>
							<Table.Th>Weekend Pay</Table.Th>
							<Table.Th>Total Pay</Table.Th>
							<Table.Th>Status</Table.Th>
							<Table.Th>Notes</Table.Th>
							<Table.Th ta="center">Actions</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{editableEntries.map((entry, index) => (
							<Table.Tr key={entry.id}>
								<Table.Td>{index + 1}</Table.Td>
								<Table.Td>{entry.teacherName}</Table.Td>
								<Table.Td>{entry.zelleId}</Table.Td>
								<Table.Td>
									<NumberInput
										w={110}
										min={0}
										decimalScale={2}
										fixedDecimalScale
										value={entry.hourlyRate}
										onChange={(value) =>
											handleChangeEntry(entry.id, { hourlyRate: Number(value || 0) })
										}
										disabled={isLocked}
									/>
								</Table.Td>
								<Table.Td>
									<NumberInput
										w={120}
										min={0}
										decimalScale={2}
										value={entry.weekdayHours}
										onChange={(value) =>
											handleChangeEntry(entry.id, { weekdayHours: Number(value || 0) })
										}
										disabled={isLocked}
									/>
								</Table.Td>
								<Table.Td>
									<NumberInput
										w={120}
										min={0}
										decimalScale={2}
										value={entry.weekendHours}
										onChange={(value) =>
											handleChangeEntry(entry.id, { weekendHours: Number(value || 0) })
										}
										disabled={isLocked}
									/>
								</Table.Td>
								<Table.Td>{formatMoney(entry.weekdayPay)}</Table.Td>
								<Table.Td>{formatMoney(entry.weekendPay)}</Table.Td>
								<Table.Td>{formatMoney(entry.totalPay)}</Table.Td>
								<Table.Td>
									<Select
										w={120}
										data={PAYROLL_STATUS_OPTIONS}
										value={entry.payStatus}
										onChange={(value) =>
											handleChangeEntry(entry.id, {
													payStatus: (value || 'DRAFT') as 'DRAFT' | 'PAID',
												})
										}
										disabled={isLocked}
									/>
								</Table.Td>
								<Table.Td>
									<TextInput
										value={entry.notes}
										onChange={(event) =>
											handleChangeEntry(entry.id, { notes: event.currentTarget.value })
										}
										disabled={isLocked}
									/>
								</Table.Td>
								<Table.Td ta="center">
									<ActionIcon
										color="red"
										variant="subtle"
										onClick={() => handleDeleteEntry(entry)}
										disabled={isLocked || isDeletingEntry}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
					<Table.Tfoot>
						<Table.Tr fw={700}>
							<Table.Td colSpan={4}>TOTAL</Table.Td>
							<Table.Td>{formatDecimal(totals.weekdayHours)}</Table.Td>
							<Table.Td>{formatDecimal(totals.weekendHours)}</Table.Td>
							<Table.Td>{formatMoney(totals.weekdayPay)}</Table.Td>
							<Table.Td>{formatMoney(totals.weekendPay)}</Table.Td>
							<Table.Td>{formatMoney(totals.totalPay)}</Table.Td>
							<Table.Td colSpan={3} />
						</Table.Tr>
					</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>
		</Stack>
	);
};
