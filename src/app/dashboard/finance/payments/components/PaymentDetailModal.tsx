import { Badge, Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import dayjs from 'dayjs';

import { ModalFooter } from '@components/ModalFooter';

import {
	CLASS_SESSION_LABELS,
	PAY_METHOD_LABELS,
	PAYMENT_STATUS_COLORS,
	PAYMENT_STATUS_LABELS,
} from '@configs/enums';

import { InvoiceRow } from '@hooks/react-query/invoices/useGetPagingInvoices';

import { formatMoney } from '@utils/money';

import { PaymentFormModal } from './PaymentFormModal';

type PaymentDetailModalProps = {
	invoice: InvoiceRow;
};

const MoneyItem = ({
	label,
	amount,
	alwaysShowAmount,
}: {
	label: string;
	amount: number;
	alwaysShowAmount?: boolean;
}) => (
	<Group justify="space-between" wrap="nowrap">
		<Text c="dimmed" size="sm">
			{label}
		</Text>
		{amount === 0 && !alwaysShowAmount ? (
			<Text c="dimmed">—</Text>
		) : (
			<Text fw={alwaysShowAmount ? 700 : 500}>{formatMoney(amount)}</Text>
		)}
	</Group>
);

export const PaymentDetailModal = ({ invoice }: PaymentDetailModalProps) => {
	const paymentStatusLabel = PAYMENT_STATUS_LABELS[invoice.paymentStatus] || invoice.paymentStatus;
	const payMethodLabel = PAY_METHOD_LABELS[invoice.payMethod] || invoice.payMethod;
	const balanceColor = invoice.balance > 0 ? 'red.7' : 'green.7';

	const handleOpenEdit = () => {
		modals.open({
			title: 'Edit Monthly Payment',
			size: 'xl',
			children: <PaymentFormModal invoice={invoice} />,
		});
	};

	return (
		<Stack>
			<Group gap="xs" wrap="wrap">
				<Badge color={PAYMENT_STATUS_COLORS[invoice.paymentStatus]} variant="light">
					{paymentStatusLabel}
				</Badge>

				{invoice.studentCount > 0 && (
					<Badge variant="light" color="dark">
						{invoice.studentCount} student{invoice.studentCount > 1 ? 's' : ''}
					</Badge>
				)}

				{invoice.session && invoice.session !== 'NA' && (
					<Badge variant="light" color="cyan">
						{CLASS_SESSION_LABELS[invoice.session]}
					</Badge>
				)}

				{invoice.payMethod !== 'NA' && (
					<Badge variant="light" color="indigo">
						{payMethodLabel}
					</Badge>
				)}
			</Group>

			<Paper withBorder radius="md" p="md">
				<Text fw={700}>Charges</Text>
				<Stack gap={6}>
					<MoneyItem label="Registration Fee" amount={invoice.registrationFee} />
					<MoneyItem label="Tuition Fee" amount={invoice.tuitionFee} />
					<MoneyItem label="Book Fee" amount={invoice.bookFee} />
				</Stack>
				<Divider my="sm" />
				<MoneyItem label="Total Due" amount={invoice.totalDue} alwaysShowAmount />
			</Paper>

			<Paper withBorder radius="md" p="md">
				<Text fw={700}>Payments</Text>
				<Stack gap={6}>
					<MoneyItem label="Paid Registration" amount={invoice.paidRegistrationFee} />
					<MoneyItem label="Paid Tuition" amount={invoice.paidTuitionFee} />
					<MoneyItem label="Paid Books" amount={invoice.paidBookFee} />
					<MoneyItem label="Extra Paid" amount={invoice.extraPaid} />
				</Stack>
				<Divider my="sm" />
				<MoneyItem label="Total Paid" amount={invoice.totalPaid} alwaysShowAmount />
			</Paper>

			<Paper withBorder radius="md" p="md" bg={invoice.balance > 0 ? 'red.0' : 'green.0'}>
				<Group justify="space-between" wrap="nowrap">
					<Text fw={700}>Balance</Text>
					<Text fw={700} fz="xl" c={balanceColor}>
						{formatMoney(invoice.balance)}
					</Text>
				</Group>
			</Paper>

			{(invoice.paidAt || invoice.notes) && (
				<Stack gap={6}>
					{invoice.paidAt && (
						<Group justify="space-between" wrap="nowrap">
							<Text c="dimmed" size="sm">
								Paid At
							</Text>
							<Text>{dayjs(invoice.paidAt).format('MM/DD/YYYY')}</Text>
						</Group>
					)}

					{invoice.notes && (
						<Group align="flex-start" justify="space-between" wrap="nowrap">
							<Text c="dimmed" size="sm">
								Notes
							</Text>
							<Text ta="right" style={{ whiteSpace: 'pre-wrap' }}>
								{invoice.notes}
							</Text>
						</Group>
					)}
				</Stack>
			)}

			<ModalFooter>
				<Button variant="default" onClick={() => modals.closeAll()}>
					Close
				</Button>
				<Button onClick={handleOpenEdit}>Edit</Button>
			</ModalFooter>
		</Stack>
	);
};
