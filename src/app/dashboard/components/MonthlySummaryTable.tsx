import { Divider, Paper, Table, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type MonthlySummaryTableProps = {
	monthly: DashboardSummary['monthly'];
	totals: DashboardSummary['totals'];
};

export const MonthlySummaryTable = ({
	monthly,
	totals,
}: MonthlySummaryTableProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4}>Monthly Dashboard Summary</Title>

			<Divider my="md" />

			<Table.ScrollContainer minWidth={900}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="sm"
					horizontalSpacing="md"
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Month</Table.Th>
							<Table.Th ta="center">No of Students</Table.Th>
							<Table.Th ta="right">Income</Table.Th>
							<Table.Th ta="right">Expense</Table.Th>
							<Table.Th ta="right">Profit</Table.Th>
							<Table.Th ta="right">Unpaid Balance</Table.Th>
						</Table.Tr>
					</Table.Thead>

					<Table.Tbody>
						{monthly.map((item) => (
							<Table.Tr key={item.month}>
								<Table.Td>{item.label}</Table.Td>
								<Table.Td
									ta="center"
									c={item.students > 0 ? 'blue' : 'gray'}
									fw={item.students > 0 ? 600 : 500}
								>
									{item.students}
								</Table.Td>
								<Table.Td ta="right" c={item.income > 0 ? 'green' : 'gray'}>
									{formatMoney(item.income)}
								</Table.Td>
								<Table.Td ta="right" c={item.expense > 0 ? 'red' : 'gray'}>
									{formatMoney(item.expense)}
								</Table.Td>
								<Table.Td ta="right" c={item.profit >= 0 ? 'green' : 'red'} fw={600}>
									{formatMoney(item.profit)}
								</Table.Td>
								<Table.Td
									ta="right"
									c={item.unpaidBalance > 0 ? 'red' : 'gray'}
									fw={item.unpaidBalance > 0 ? 600 : 500}
								>
									{formatMoney(item.unpaidBalance)}
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>

					<Table.Tfoot
						style={{
							borderTop: '2px solid var(--mantine-color-gray-3)',
							backgroundColor: 'var(--mantine-color-gray-0)',
						}}
					>
						<Table.Tr>
							<Table.Td fw={700}>TOTAL</Table.Td>
							<Table.Td ta="center" c="blue" fw={700}>
								{totals.students}
							</Table.Td>
							<Table.Td ta="right" c="green" fw={700}>
								{formatMoney(totals.income)}
							</Table.Td>
							<Table.Td ta="right" c="red" fw={700}>
								{formatMoney(totals.expense)}
							</Table.Td>
							<Table.Td ta="right" c={totals.profit >= 0 ? 'green' : 'red'} fw={700}>
								{formatMoney(totals.profit)}
							</Table.Td>
							<Table.Td ta="right" c="red" fw={700}>
								{formatMoney(totals.unpaidBalance)}
							</Table.Td>
						</Table.Tr>
					</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
