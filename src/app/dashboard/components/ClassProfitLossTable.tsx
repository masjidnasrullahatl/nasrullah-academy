import { Divider, Paper, Table, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type ClassProfitLossTableProps = {
	data: DashboardSummary['classProfitLoss'];
};

export const ClassProfitLossTable = ({ data }: ClassProfitLossTableProps) => {
	const totals = data.reduce(
		(acc, item) => {
			acc.students += item.enrollmentCount;
			acc.revenue += item.revenue;
			acc.expense += item.expense;
			acc.profit += item.profit;
			return acc;
		},
		{ students: 0, revenue: 0, expense: 0, profit: 0 },
	);

	return (
		<Paper p="md" withBorder>
			<Title order={4}>Profit &amp; Loss by Class</Title>

			<Divider my="md" />

			<Table.ScrollContainer minWidth={860}>
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
							<Table.Th>#</Table.Th>
							<Table.Th>Class</Table.Th>
							<Table.Th>Program</Table.Th>
							<Table.Th ta="center">Students</Table.Th>
							<Table.Th ta="right">Revenue</Table.Th>
							<Table.Th ta="right">Expense</Table.Th>
							<Table.Th ta="right">Profit</Table.Th>
						</Table.Tr>
					</Table.Thead>

					<Table.Tbody>
						{data.length ? (
							data.map((item, index) => (
								<Table.Tr key={item.classId}>
									<Table.Td>{index + 1}</Table.Td>
									<Table.Td>{item.className}</Table.Td>
									<Table.Td>{item.programName}</Table.Td>
									<Table.Td ta="center">{item.enrollmentCount}</Table.Td>
									<Table.Td ta="right" c={item.revenue > 0 ? 'green' : 'gray'}>
										{formatMoney(item.revenue)}
									</Table.Td>
									<Table.Td ta="right" c={item.expense > 0 ? 'red' : 'gray'}>
										{formatMoney(item.expense)}
									</Table.Td>
									<Table.Td ta="right" c={item.profit >= 0 ? 'green' : 'red'} fw={600}>
										{formatMoney(item.profit)}
									</Table.Td>
								</Table.Tr>
							))
						) : (
							<Table.Tr>
								<Table.Td colSpan={7}>No class data available for this year</Table.Td>
							</Table.Tr>
						)}
					</Table.Tbody>

					{data.length > 0 && (
						<Table.Tfoot
							style={{
								borderTop: '2px solid var(--mantine-color-gray-3)',
								backgroundColor: 'var(--mantine-color-gray-0)',
							}}
						>
							<Table.Tr>
								<Table.Td colSpan={3} fw={700}>
									TOTAL
								</Table.Td>
								<Table.Td ta="center" fw={700}>
									{totals.students}
								</Table.Td>
								<Table.Td ta="right" fw={700} c="green">
									{formatMoney(totals.revenue)}
								</Table.Td>
								<Table.Td ta="right" fw={700} c="red">
									{formatMoney(totals.expense)}
								</Table.Td>
								<Table.Td ta="right" fw={700} c={totals.profit >= 0 ? 'green' : 'red'}>
									{formatMoney(totals.profit)}
								</Table.Td>
							</Table.Tr>
						</Table.Tfoot>
					)}
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
