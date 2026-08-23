import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th ta="center" className={stickyStyles.stickyLeft}>
					#
				</Table.Th>

				<Table.Th>Student Name</Table.Th>

				<Table.Th>Family</Table.Th>

				<Table.Th>Gender</Table.Th>

				<Table.Th>Date of Birth</Table.Th>

				<Table.Th>Class(es)</Table.Th>

				<Table.Th ta="center">Status</Table.Th>

				<Table.Th w={1} ta="center" className={stickyStyles.stickyRight}>
					Actions
				</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
