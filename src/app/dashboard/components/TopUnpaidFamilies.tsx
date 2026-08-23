import { Divider, Paper, Table, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type TopUnpaidFamiliesProps = {
	data: DashboardSummary['topUnpaidFamilies'];
};

export const TopUnpaidFamilies = ({ data }: TopUnpaidFamiliesProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4}>Top Unpaid Families</Title>

			<Divider my="md" />

			<Table.ScrollContainer minWidth={640}>
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
							<Table.Th>Family</Table.Th>
							<Table.Th>Balance</Table.Th>
						</Table.Tr>
					</Table.Thead>

					<Table.Tbody>
						{data.length === 0 ? (
							<Table.Tr>
								<Table.Td colSpan={3}>No unpaid families</Table.Td>
							</Table.Tr>
						) : (
							data.map((item, index) => (
								<Table.Tr key={item.familyId}>
									<Table.Td>{index + 1}</Table.Td>
									<Table.Td>{item.name}</Table.Td>
									<Table.Td c="red" fw={600}>
										{formatMoney(item.balance)}
									</Table.Td>
								</Table.Tr>
							))
						)}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
