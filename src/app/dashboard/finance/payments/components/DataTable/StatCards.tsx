import { Grid, Paper, Text } from '@mantine/core';

import { InvoicesPagingResponse } from '@hooks/react-query/invoices/useGetPagingInvoices';

import { formatMoney } from '@utils/money';

type Props = {
	invoices?: InvoicesPagingResponse;
};

export const StatCards = ({ invoices }: Props) => {
	return (
		<Grid>
			<Grid.Col span={{ base: 12, md: 3 }}>
				<Paper p="md" withBorder>
					<Text c="dimmed" size="sm">
						Students
					</Text>
					<Text fw={700} size="lg">
						{invoices?.summary.studentCount || 0}
					</Text>
				</Paper>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 3 }}>
				<Paper p="md" withBorder>
					<Text c="dimmed" size="sm">
						Total Due
					</Text>
					<Text c="red" fw={700} size="lg">
						{formatMoney(invoices?.summary.totalDue || 0)}
					</Text>
				</Paper>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 3 }}>
				<Paper p="md" withBorder>
					<Text c="dimmed" size="sm">
						Total Paid
					</Text>
					<Text c="green" fw={700} size="lg">
						{formatMoney(invoices?.summary.totalPaid || 0)}
					</Text>
				</Paper>
			</Grid.Col>

			<Grid.Col span={{ base: 12, md: 3 }}>
				<Paper p="md" withBorder>
					<Text c="dimmed" size="sm">
						Balance
					</Text>
					<Text fw={700} size="lg">
						{formatMoney(invoices?.summary.balance || 0)}
					</Text>
				</Paper>
			</Grid.Col>
		</Grid>
	);
};
