import { Table } from '@mantine/core';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th>#</Table.Th>

				<Table.Th>Class Name</Table.Th>

				<Table.Th>Program</Table.Th>

				<Table.Th ta="center">Students</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
