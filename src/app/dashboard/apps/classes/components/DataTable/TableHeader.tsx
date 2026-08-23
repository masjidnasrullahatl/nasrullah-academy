import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th ta="center" className={stickyStyles.stickyLeft}>
					#
				</Table.Th>

				<Table.Th>Class</Table.Th>

				<Table.Th>Teacher</Table.Th>

				<Table.Th ta="center">Students</Table.Th>

				<Table.Th ta="center">Boys</Table.Th>

				<Table.Th ta="center">Girls</Table.Th>

				<Table.Th ta="center">Status</Table.Th>

				<Table.Th w={1} ta="center" className={stickyStyles.stickyRight}>
					Actions
				</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
