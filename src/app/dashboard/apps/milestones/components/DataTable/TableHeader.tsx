import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th w={60} ta="center" className={stickyStyles.stickyLeft}>
					#
				</Table.Th>

				<Table.Th>Date</Table.Th>

				<Table.Th>Student</Table.Th>

				<Table.Th>Family</Table.Th>

				<Table.Th>Programs</Table.Th>

				<Table.Th>Milestone</Table.Th>

				<Table.Th>Notes</Table.Th>

				<Table.Th w={1} ta="center" className={stickyStyles.stickyRight}>
					Actions
				</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
