import { useState } from 'react';

import { Button, Group, Select, Stack, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { PayMethod } from '@prisma/client';
import dayjs from 'dayjs';

import { ModalFooter } from '@components/ModalFooter';

import { PAY_METHOD_OPTIONS } from '@configs/enums';

import { InvoiceRow } from '@hooks/react-query/invoices/useGetPagingInvoices';
import { useUpdateInvoice } from '@hooks/react-query/invoices/useUpdateInvoice';

import { formatMoney } from '@utils/money';

type Props = {
	invoice: InvoiceRow;
};

export const ConfirmPaymentModal = ({ invoice }: Props) => {
	const [payMethod, setPayMethod] = useState<PayMethod>(
		invoice.payMethod !== 'NA' ? invoice.payMethod : 'KEELA',
	);
	const [paidAt, setPaidAt] = useState<Date | null>(new Date());

	const { mutateAsync: updateInvoice, isPending } = useUpdateInvoice();

	const handleConfirm = async () => {
		await updateInvoice({
			id: invoice.id,
			data: {
				year: invoice.year,
				month: invoice.month,
				studentCount: invoice.studentCount,
				registrationFee: invoice.registrationFee,
				tuitionFee: invoice.tuitionFee,
				bookFee: invoice.bookFee,
				paidRegistrationFee: invoice.registrationFee,
				paidTuitionFee: invoice.tuitionFee,
				paidBookFee: invoice.bookFee,
				extraPaid: invoice.extraPaid,
				payMethod,
				paymentStatus: 'PAID',
				paidAt: dayjs(paidAt || new Date()).toISOString(),
				notes: invoice.notes,
			},
		});

		notifications.show({
			title: 'Payment received',
			message: `${invoice.family.name} marked as paid`,
			color: 'green',
		});

		modals.closeAll();
	};

	return (
		<Stack>
			<Text size="sm">
				Confirm <b>{formatMoney(invoice.totalDue)}</b> received from{' '}
				<b>{invoice.family.name}</b> for <b>{invoice.program.name}</b>.
			</Text>

			<Group grow>
				<Select
					label="Pay method"
					data={PAY_METHOD_OPTIONS}
					value={payMethod}
					allowDeselect={false}
					onChange={(value) => value && setPayMethod(value as PayMethod)}
				/>
				<DateInput
					label="Paid on"
					value={paidAt}
					onChange={(value) => setPaidAt((value as Date | null) || null)}
				/>
			</Group>

			<ModalFooter>
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button color="green" loading={isPending} onClick={handleConfirm}>
					Confirm payment
				</Button>
			</ModalFooter>
		</Stack>
	);
};
