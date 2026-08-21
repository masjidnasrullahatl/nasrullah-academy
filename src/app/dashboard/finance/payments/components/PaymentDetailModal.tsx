import { Badge, Button, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
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
	const sessionLabel = invoice.session ? CLASS_SESSION_LABELS[invoice.session] : 'N/A';
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
			<Group wrap="wrap">
				<Badge variant="light">{invoice.program.name}</Badge>
				<Badge variant="light">{sessionLabel}</Badge>
				<Badge color={PAYMENT_STATUS_COLORS[invoice.paymentStatus]} variant="light">
					{paymentStatusLabel}
				</Badge>
				<Badge variant="light">{payMethodLabel}</Badge>
			</Group>

			<Stack gap="xs">
				<Text fw={700}>Charges</Text>
				<SimpleGrid cols={{ base: 1, sm: 2 }}>
					<MoneyItem label="Registration Fee" amount={invoice.registrationFee} />
					<MoneyItem label="Tuition Fee" amount={invoice.tuitionFee} />
					<MoneyItem label="Book Fee" amount={invoice.bookFee} />
				</SimpleGrid>
				<Divider />
				<MoneyItem label="Total Due" amount={invoice.totalDue} alwaysShowAmount />
			</Stack>

			<Stack gap="xs">
				<Text fw={700}>Payments</Text>
				<SimpleGrid cols={{ base: 1, sm: 2 }}>
					<MoneyItem label="Paid Registration" amount={invoice.paidRegistrationFee} />
					<MoneyItem label="Paid Tuition" amount={invoice.paidTuitionFee} />
					<MoneyItem label="Paid Books" amount={invoice.paidBookFee} />
					<MoneyItem label="Extra Paid" amount={invoice.extraPaid} />
				</SimpleGrid>
				<Divider />
				<MoneyItem label="Total Paid" amount={invoice.totalPaid} alwaysShowAmount />
			</Stack>

			<Group justify="space-between" wrap="nowrap">
				<Text fw={700}>Balance</Text>
				<Text fw={700} c={balanceColor}>
					{formatMoney(invoice.balance)}
				</Text>
			</Group>

			<Group justify="space-between" wrap="nowrap">
				<Text c="dimmed" size="sm">
					Paid At
				</Text>
				<Text>{invoice.paidAt ? dayjs(invoice.paidAt).format('MM/DD/YYYY') : '—'}</Text>
			</Group>

			<Stack gap={6}>
				<Text c="dimmed" size="sm">
					Notes
				</Text>
				{invoice.notes ? <Text style={{ whiteSpace: 'pre-wrap' }}>{invoice.notes}</Text> : <Text c="dimmed">No notes</Text>}
			</Stack>

			<ModalFooter>
				<Button onClick={handleOpenEdit}>Edit</Button>
				<Button variant="default" onClick={() => modals.closeAll()}>
					Close
				</Button>
			</ModalFooter>
		</Stack>
	);
};
