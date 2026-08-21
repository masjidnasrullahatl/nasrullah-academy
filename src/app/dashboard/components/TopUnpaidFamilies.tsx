import { Paper, Table, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type TopUnpaidFamiliesProps = {
	data: DashboardSummary['topUnpaidFamilies'];
};

export const TopUnpaidFamilies = ({ data }: TopUnpaidFamiliesProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Top Unpaid Families
			</Title>
			<Table.ScrollContainer minWidth={640}>
				<Table bg="white" border={1}>
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
								<Table.Td>{formatMoney(item.balance)}</Table.Td>
							</Table.Tr>
						))
					)}
				</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
