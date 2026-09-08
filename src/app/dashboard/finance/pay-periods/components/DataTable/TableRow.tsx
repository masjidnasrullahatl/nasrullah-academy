import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconCheck, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	PAY_PERIOD_STATUS_COLORS,
	PAY_PERIOD_STATUS_LABELS,
} from '@configs/enums';
import { PATH_FINANCE } from '@configs/routes';

import { useDeletePayPeriod } from '@hooks/react-query/pay-periods/useDeletePayPeriod';
import { PayPeriodRow } from '@hooks/react-query/pay-periods/useGetPagingPayPeriods';
import { useUpdatePayPeriod } from '@hooks/react-query/pay-periods/useUpdatePayPeriod';

import { PayPeriodFormModal } from '../PayPeriodFormModal';

type Props = {
	payPeriod: PayPeriodRow;
	index: number;
	page: number;
	pageSize: number;
	totalTeachersWithClasses: number;
};

export const TableRow = ({
	payPeriod,
	index,
	page,
	pageSize,
	totalTeachersWithClasses,
}: Props) => {
	const { mutateAsync: deletePayPeriod, isPending: isDeleting } =
		useDeletePayPeriod();

	const { mutateAsync: updatePayPeriod, isPending: isUpdating } =
		useUpdatePayPeriod();

	const isOpen = payPeriod.status === 'OPEN';
	const isLocked = payPeriod.status === 'LOCKED';

	const handleDelete = () => {
		modals.openConfirmModal({
			title: 'Delete pay period?',
			children:
				'This will remove all time entries and submissions in this period.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deletePayPeriod(payPeriod.id);
					notifications.show({
						color: 'green',
						title: 'Deleted',
						message: 'Pay period deleted successfully',
					});
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Delete failed',
						message:
							error instanceof Error ? error.message : 'Unexpected error',
					});
				}
			},
		});
	};

	const handleMarkAsPaid = () => {
		modals.openConfirmModal({
			title: 'Mark as paid?',
			children: 'This will mark the locked pay period as PAID.',
			labels: { confirm: 'Mark as Paid', cancel: 'Cancel' },
			onConfirm: async () => {
				try {
					await updatePayPeriod({ id: payPeriod.id, data: { status: 'PAID' } });
					notifications.show({
						title: 'Updated',
						message: 'Pay period marked as paid',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Update failed',
						message:
							error instanceof Error ? error.message : 'Unexpected error',
					});
				}
			},
		});
	};

	const handleEdit = () => {
		modals.open({
			title: 'Edit Pay Period',
			size: 'lg',
			children: <PayPeriodFormModal payPeriod={payPeriod} />,
		});
	};

	return (
		<Table.Tr>
			<Table.Td className={stickyStyles.stickyLeft}>
				{(page - 1) * pageSize + index + 1}
			</Table.Td>

			<Table.Td fw={600}>{payPeriod.name}</Table.Td>

			<Table.Td>
				<Text size="sm">
					{dayjs(payPeriod.startDate).format('MM/DD/YYYY')} –{' '}
					{dayjs(payPeriod.endDate).format('MM/DD/YYYY')}
				</Text>
			</Table.Td>

			<Table.Td ta="center">{payPeriod._count.timeEntries}</Table.Td>

			<Table.Td ta="center">
				{payPeriod._count.submissions} / {totalTeachersWithClasses} submitted
			</Table.Td>

			<Table.Td>
				<Badge
					color={PAY_PERIOD_STATUS_COLORS[payPeriod.status]}
					variant="light"
				>
					{PAY_PERIOD_STATUS_LABELS[payPeriod.status]}
				</Badge>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group justify="center" gap={8} wrap="nowrap">
					<Tooltip label="View detail">
						<ActionIcon
							variant="subtle"
							color="blue"
							component="a"
							href={`${PATH_FINANCE.payPeriods}/${payPeriod.id}`}
						>
							<IconEye size={16} />
						</ActionIcon>
					</Tooltip>

					{isOpen && (
						<>
							<Tooltip label="Edit">
								<ActionIcon
									variant="subtle"
									color="yellow"
									onClick={handleEdit}
								>
									<IconEdit size={16} />
								</ActionIcon>
							</Tooltip>

							<Tooltip label="Delete">
								<ActionIcon
									variant="subtle"
									color="red"
									onClick={handleDelete}
									disabled={isDeleting}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</>
					)}

					{isLocked && (
						<Tooltip label="Mark as paid">
							<ActionIcon
								variant="subtle"
								color="teal"
								onClick={handleMarkAsPaid}
								disabled={isUpdating}
							>
								<IconCheck size={16} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
