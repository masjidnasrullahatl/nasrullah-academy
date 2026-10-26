import { Loader, Paper, Table, Text, Title } from '@mantine/core';

import { MilestoneSummaryItem } from '../utils';

type Props = {
	items: MilestoneSummaryItem[];
	isLoading: boolean;
};

// Students per milestone for the current filters (all pages, not just this one)
export const MilestoneSummary = ({ items, isLoading }: Props) => (
	<Paper p="md">
		<Title order={5} mb="sm">
			Students per milestone
		</Title>

		{isLoading ? (
			<Loader size="sm" />
		) : items.length ? (
			<Table.ScrollContainer minWidth={500}>
				<Table striped="even" withTableBorder withColumnBorders>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Milestone</Table.Th>
							<Table.Th ta="center">Current students</Table.Th>
							<Table.Th ta="center">Former students</Table.Th>
							<Table.Th ta="center">Total</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{items.map((item) => (
							<Table.Tr key={item.label}>
								<Table.Td>{item.label}</Table.Td>
								<Table.Td ta="center">{item.current}</Table.Td>
								<Table.Td ta="center">{item.former}</Table.Td>
								<Table.Td ta="center" fw={600}>
									{item.total}
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
		) : (
			<Text c="dimmed" size="sm">
				No milestones found
			</Text>
		)}
	</Paper>
);
