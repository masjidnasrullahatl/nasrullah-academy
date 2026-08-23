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

			<Table.ScrollContainer minWidth={680}>
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
							<Table.Th>No of Students</Table.Th>
							<Table.Th>Income</Table.Th>
							<Table.Th>Unpaid Balance</Table.Th>
						</Table.Tr>
					</Table.Thead>

					<Table.Tbody>
						{monthly.map((item) => (
							<Table.Tr key={item.month}>
								<Table.Td>{item.label}</Table.Td>
								<Table.Td
									c={item.students > 0 ? 'blue' : 'gray'}
									fw={item.students > 0 ? 600 : 500}
								>
									{item.students}
								</Table.Td>
								<Table.Td
									c={item.income > 0 ? 'green' : 'gray'}
									fw={item.income > 0 ? 600 : 500}
								>
									{formatMoney(item.income)}
								</Table.Td>
								<Table.Td
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
						<Table.Tr fw={700}>
							<Table.Td fw={700}>TOTAL</Table.Td>
							<Table.Td c="blue" fw={700}>
								{totals.students}
							</Table.Td>
							<Table.Td c="green" fw={700}>
								{formatMoney(totals.income)}
							</Table.Td>
							<Table.Td c="red" fw={700}>
								{formatMoney(totals.unpaidBalance)}
							</Table.Td>
						</Table.Tr>
					</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
