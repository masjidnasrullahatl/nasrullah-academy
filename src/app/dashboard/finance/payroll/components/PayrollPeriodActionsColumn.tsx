import { ActionIcon, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconEdit, IconLockCheck, IconLockOpen, IconTrash } from '@tabler/icons-react';

import { useDeletePayrollPeriod } from '@hooks/react-query/payroll/useDeletePayrollPeriod';
import { PayrollPeriodRow } from '@hooks/react-query/payroll/useGetPagingPayrollPeriods';
import { useUpdatePayrollPeriod } from '@hooks/react-query/payroll/useUpdatePayrollPeriod';

import { PayrollPeriodFormModal } from './PayrollPeriodFormModal';

type PayrollPeriodActionsColumnProps = {
	period: PayrollPeriodRow;
};

export const PayrollPeriodActionsColumn = ({ period }: PayrollPeriodActionsColumnProps) => {
	const { mutateAsync: updatePeriod, isPending: isUpdating } = useUpdatePayrollPeriod();
	const { mutateAsync: deletePeriod, isPending: isDeleting } = useDeletePayrollPeriod();

	const handleEdit = () => {
		modals.open({
			title: 'Edit Payroll Period',
			size: 'lg',
			children: <PayrollPeriodFormModal period={period} />,
		});
	};

	const handleToggleStatus = () => {
		const nextStatus = period.status === 'PAID' ? 'DRAFT' : 'PAID';
		modals.openConfirmModal({
			title: nextStatus === 'PAID' ? 'Mark period as PAID?' : 'Reopen period to DRAFT?',
			labels: {
				confirm: nextStatus === 'PAID' ? 'Mark as PAID' : 'Reopen',
				cancel: 'Cancel',
			},
			onConfirm: async () => {
				await updatePeriod({
					id: period.id,
					data: {
						label: period.label,
						year: period.year,
						month: period.month,
						startDate: new Date(period.startDate).toISOString(),
						endDate: new Date(period.endDate).toISOString(),
						status: nextStatus,
						notes: period.notes,
					},
				});

				notifications.show({
					title: nextStatus === 'PAID' ? 'Period marked as PAID' : 'Period reopened',
					message:
						nextStatus === 'PAID'
							? 'This payroll period is now locked'
							: 'This payroll period can now be edited',
					color: 'green',
				});
			},
		});
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: `Delete payroll period ${period.label}?`,
			children: 'This deletes the payroll period and all payroll entries inside it.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deletePeriod({ id: period.id });
				notifications.show({
					title: 'Payroll period deleted',
					message: 'Period deleted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
		<Group gap={4} justify="center" wrap="nowrap">
			<ActionIcon onClick={handleEdit} variant="subtle" disabled={isUpdating || isDeleting}>
				<IconEdit size={16} />
			</ActionIcon>
			<ActionIcon
				onClick={handleToggleStatus}
				variant="subtle"
				color={period.status === 'PAID' ? 'yellow' : 'green'}
				disabled={isUpdating || isDeleting}
			>
				{period.status === 'PAID' ? <IconLockOpen size={16} /> : <IconLockCheck size={16} />}
			</ActionIcon>
			<ActionIcon onClick={handleDelete} variant="subtle" color="red" disabled={isDeleting || isUpdating}>
				<IconTrash size={16} />
			</ActionIcon>
		</Group>
	);
};
