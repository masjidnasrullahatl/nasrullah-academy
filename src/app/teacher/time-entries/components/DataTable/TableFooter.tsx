import { Table, Text } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

type Props = {
	totalHours: number;
};

export const TableFooter = ({ totalHours }: Props) => {
	return (
		<Table.Tfoot
			style={{
				borderTop: '2px solid var(--mantine-color-gray-3)',
				backgroundColor: 'var(--mantine-color-gray-0)',
			}}
		>
			<Table.Tr>
				<Table.Td colSpan={5} fw={700} className={stickyStyles.stickyLeft}>
					<Text fz="sm">Total hours: {totalHours.toFixed(2)}</Text>
				</Table.Td>

				<Table.Td className={stickyStyles.stickyRight} />
			</Table.Tr>
		</Table.Tfoot>
	);
};
