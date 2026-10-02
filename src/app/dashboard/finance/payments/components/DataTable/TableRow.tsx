import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconCheck, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';

import {
	MONTH_OPTIONS,
	PAY_METHOD_LABELS,
	PAYMENT_STATUS_COLORS,
	PAYMENT_STATUS_LABELS,
} from '@configs/enums';

import { useDeleteInvoice } from '@hooks/react-query/invoices/useDeleteInvoice';
import { InvoiceRow } from '@hooks/react-query/invoices/useGetPagingInvoices';

import { formatMoney } from '@utils/money';

import { ConfirmPaymentModal } from '../ConfirmPaymentModal';
import { PaymentDetailModal } from '../PaymentDetailModal';
import { PaymentFormModal } from '../PaymentFormModal';

type Props = {
	invoice: InvoiceRow;
	page: number;
	index: number;
	pageSize: number;
};

export const TableRow = ({ invoice, page, index, pageSize }: Props) => {
	const { mutateAsync: deleteInvoice, isPending: isDeleting } =
		useDeleteInvoice();

	const openDetail = (item: InvoiceRow) => {
		const monthLabel = MONTH_OPTIONS.find(
			(m) => Number(m.value) === item.month,
		)?.label;
		modals.open({
			title: `${item.family.name} — ${monthLabel || item.month} ${item.year}`,
			size: 'lg',
			children: <PaymentDetailModal invoice={item} />,
		});
	};

	const handleEdit = (item: InvoiceRow) => {
		modals.open({
			title: 'Edit Monthly Payment',
			size: 'xl',
			children: <PaymentFormModal invoice={item} />,
		});
	};

	const handleDelete = (item: InvoiceRow) => {
		modals.openConfirmModal({
			title: `Delete payment for ${item.family.name}?`,
			children: `This deletes the ${item.month}/${item.year} invoice row.`,
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteInvoice({ id: item.id });
				notifications.show({
					title: 'Payment deleted',
					message: 'Invoice row deleted successfully',
					color: 'green',
				});
			},
		});
	};

	const handleMarkAsPaid = (item: InvoiceRow) => {
		modals.open({
			title: 'Confirm payment received',
			size: 'md',
			children: <ConfirmPaymentModal invoice={item} />,
		});
	};

	const payMethodLabel =
		PAY_METHOD_LABELS[invoice.payMethod] || invoice.payMethod;
	const statusLabel =
		PAYMENT_STATUS_LABELS[invoice.paymentStatus] || invoice.paymentStatus;

	return (
		<Table.Tr
			key={invoice.id}
			style={{ cursor: 'pointer' }}
			onClick={() => openDetail(invoice)}
		>
			<Table.Td className={stickyStyles.stickyLeft}>
				{(page - 1) * pageSize + index + 1}
			</Table.Td>

			<Table.Td>{invoice.family.name}</Table.Td>

			<Table.Td>{invoice.program.name}</Table.Td>

			<Table.Td ta="center">{invoice.studentCount}</Table.Td>

			<Table.Td ta="right">{formatMoney(invoice.totalDue)}</Table.Td>

			<Table.Td ta="right">{formatMoney(invoice.totalPaid)}</Table.Td>

			<Table.Td ta="right">
				<Text
					fz="sm"
					fw={700}
					c={invoice.balance > 0 ? 'red.7' : 'green.7'}
					span
				>
					{formatMoney(invoice.balance)}
				</Text>
			</Table.Td>

			<Table.Td>{payMethodLabel}</Table.Td>

			<Table.Td>
				<Badge
					color={PAYMENT_STATUS_COLORS[invoice.paymentStatus]}
					variant="light"
				>
					{statusLabel}
				</Badge>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group
					gap="xs"
					justify="center"
					wrap="nowrap"
					onClick={(event) => event.stopPropagation()}
				>
					<Tooltip label="View details">
						<ActionIcon onClick={() => openDetail(invoice)}>
							<IconEye size={15} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Edit">
						<ActionIcon color="yellow" onClick={() => handleEdit(invoice)}>
							<IconEdit size={15} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Confirm payment received">
						<ActionIcon
							color="green"
							disabled={invoice.paymentStatus === 'PAID'}
							onClick={() => handleMarkAsPaid(invoice)}
						>
							<IconCheck size={15} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Delete">
						<ActionIcon
							disabled={isDeleting}
							loading={isDeleting}
							color="red"
							onClick={() => handleDelete(invoice)}
						>
							<IconTrash size={15} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
