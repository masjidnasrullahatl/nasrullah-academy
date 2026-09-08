import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th w={40} className={stickyStyles.stickyLeft}>
					#
				</Table.Th>

				<Table.Th w={150}>Date</Table.Th>

				<Table.Th w={250}>Class</Table.Th>

				<Table.Th w={150}>Hours</Table.Th>

				<Table.Th flex={1}>Notes</Table.Th>

				<Table.Th w={1} ta="center" className={stickyStyles.stickyRight}>
					Actions
				</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
