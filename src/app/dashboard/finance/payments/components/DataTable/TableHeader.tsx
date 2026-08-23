import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const TableHeader = () => {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th className={stickyStyles.stickyLeft}>#</Table.Th>
				<Table.Th>Family</Table.Th>
				<Table.Th ta="center">#Kids</Table.Th>
				<Table.Th ta="right">Total Due</Table.Th>
				<Table.Th ta="right">Total Paid</Table.Th>
				<Table.Th ta="right">Balance</Table.Th>
				<Table.Th>Method</Table.Th>
				<Table.Th>Status</Table.Th>
				<Table.Th ta="center" className={stickyStyles.stickyRight}>
					Actions
				</Table.Th>
			</Table.Tr>
		</Table.Thead>
	);
};
