import { useEffect, useMemo, useState } from 'react';

import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Paper,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertCircle, IconPlus, IconUpload } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { useDeleteMyTimeEntry } from '@hooks/react-query/teacher/useDeleteMyTimeEntry';
import { useGetMyClasses } from '@hooks/react-query/teacher/useGetMyClasses';
import {
	MyTimeEntry,
	useGetMyTimeEntries,
} from '@hooks/react-query/teacher/useGetMyTimeEntries';
import { useGetTeacherPayPeriods } from '@hooks/react-query/teacher/useGetTeacherPayPeriods';
import { useSubmitMyHours } from '@hooks/react-query/teacher/useSubmitMyHours';

import { TimeEntryFormModal } from '../TimeEntryFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

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
			<Badge color="green">
				Submitted on {dayjs(submittedAt).format('MM/DD/YYYY')}
			</Badge>
		);
	}

	return (
		<Badge size="lg" color="blue">
			Open
		</Badge>
	);
};

export const DataTable = () => {
	const { data: periods, isLoading: isLoadingPeriods } =
		useGetTeacherPayPeriods();
	const { data: classes, isLoading: isLoadingClasses } = useGetMyClasses();

	const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string | null>(
		null,
	);

	const {
		data: entryResult,
		isLoading: isLoadingEntries,
		isError,
		error,
	} = useGetMyTimeEntries(selectedPayPeriodId || undefined);

	const { mutateAsync: deleteEntry, isPending: isDeleting } =
		useDeleteMyTimeEntry();
	const { mutateAsync: submitHours, isPending: isSubmitting } =
		useSubmitMyHours();

	const selectedPeriod = useMemo(
		() => periods?.find((period) => period.id === selectedPayPeriodId) || null,
		[periods, selectedPayPeriodId],
	);

	useEffect(() => {
		if (!periods?.length || selectedPayPeriodId) return;

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

	const openCreateModal = () => {
		if (!canManageEntries || !selectedPeriod) {
			return;
		}

		modals.open({
			title: 'Add Time Entry',
			size: 'md',
			children: (
				<TimeEntryFormModal
					selectedPeriod={selectedPeriod}
					classes={classes || []}
				/>
			),
		});
	};

	const openEditModal = (entry: MyTimeEntry) => {
		if (!canManageEntries || !selectedPeriod) {
			return;
		}

		modals.open({
			title: 'Edit Time Entry',
			size: 'md',
			children: (
				<TimeEntryFormModal
					selectedPeriod={selectedPeriod}
					classes={classes || []}
					entry={entry}
				/>
			),
		});
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
			children: (
				<Stack>
					<Text fz="sm">
						Once submitted, you cannot edit these entries. Staff can still make
						corrections. Continue?
					</Text>
					<Divider />
				</Stack>
			),
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

	const isLoading = isLoadingPeriods || isLoadingEntries || isLoadingClasses;
	const hasData = entries.length > 0;

	const rows = entries.map((entry, index) => (
		<TableRow
			key={entry.id}
			entry={entry}
			index={index}
			canManage={canManageEntries}
			busy={isDeleting}
			onEdit={openEditModal}
			onDelete={handleDelete}
		/>
	));

	return (
		<Paper p="md" withBorder>
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group justify="space-between" mb="md" wrap="wrap">
				<Group>
					<TableFilter
						periods={periods || []}
						value={selectedPayPeriodId}
						onChange={setSelectedPayPeriodId}
					/>

					<Box mt="xl">
						{selectedPeriod &&
							getStatusBadge(selectedPeriod.status, submittedAt)}
					</Box>
				</Group>

				<Group>
					{canManageEntries && (
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={openCreateModal}
						>
							Add Entry
						</Button>
					)}
					{canSubmitHours && (
						<Button
							color="green"
							leftSection={<IconUpload size={16} />}
							loading={isSubmitting}
							onClick={handleSubmitHours}
						>
							Submit Hours
						</Button>
					)}
				</Group>
			</Group>

			<Table.ScrollContainer minWidth={800}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="sm"
					horizontalSpacing="md"
				>
					<TableHeader />

					<Table.Tbody>
						{isLoading ? <LoadingBody /> : hasData ? rows : <EmptyBody />}
					</Table.Tbody>

					{!isLoading && hasData && <TableFooter totalHours={totalHours} />}
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
