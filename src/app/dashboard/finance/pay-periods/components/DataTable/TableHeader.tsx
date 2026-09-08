import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th className={stickyStyles.stickyLeft}>#</Table.Th>

				<Table.Th>Name</Table.Th>

				<Table.Th>Period</Table.Th>

				<Table.Th ta="center">Entries</Table.Th>

				<Table.Th ta="center">Submissions</Table.Th>

				<Table.Th>Status</Table.Th>

				<Table.Th w={1} ta="center" className={stickyStyles.stickyRight}>
					Actions
				</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
