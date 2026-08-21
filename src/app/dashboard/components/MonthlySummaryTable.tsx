import { Paper, Table, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';
import { formatPercent } from '@utils/number';

type MonthlySummaryTableProps = {
	monthly: DashboardSummary['monthly'];
	totals: DashboardSummary['totals'];
};

export const MonthlySummaryTable = ({ monthly, totals }: MonthlySummaryTableProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Monthly Dashboard Summary
			</Title>
			<Table.ScrollContainer minWidth={980}>
				<Table bg="white" border={1}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Month</Table.Th>
						<Table.Th>No of Students</Table.Th>
						<Table.Th>Income</Table.Th>
						<Table.Th>Expense</Table.Th>
						<Table.Th>Profit</Table.Th>
						<Table.Th>Profit Margin</Table.Th>
						<Table.Th>Unpaid Balance</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{monthly.map((item) => (
						<Table.Tr key={item.month}>
							<Table.Td>{item.label}</Table.Td>
							<Table.Td>{item.students}</Table.Td>
							<Table.Td>{formatMoney(item.income)}</Table.Td>
							<Table.Td>{formatMoney(item.expense)}</Table.Td>
							<Table.Td>{formatMoney(item.profit)}</Table.Td>
							<Table.Td>{formatPercent(item.profitMargin)}</Table.Td>
							<Table.Td>{formatMoney(item.unpaidBalance)}</Table.Td>
						</Table.Tr>
					))}
				</Table.Tbody>
				<Table.Tfoot>
					<Table.Tr fw={700}>
						<Table.Td>TOTAL</Table.Td>
						<Table.Td>{totals.students}</Table.Td>
						<Table.Td>{formatMoney(totals.income)}</Table.Td>
						<Table.Td>{formatMoney(totals.expense)}</Table.Td>
						<Table.Td>{formatMoney(totals.profit)}</Table.Td>
						<Table.Td>{formatPercent(totals.profitMargin)}</Table.Td>
						<Table.Td>{formatMoney(totals.unpaidBalance)}</Table.Td>
					</Table.Tr>
				</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
