import { Table } from '@mantine/core';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th>#</Table.Th>

				<Table.Th>Period</Table.Th>

				<Table.Th ta="right">Total Hours</Table.Th>

				<Table.Th ta="right">Hourly Rate</Table.Th>

				<Table.Th ta="right">Total Pay</Table.Th>

				<Table.Th ta="center">Status</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
