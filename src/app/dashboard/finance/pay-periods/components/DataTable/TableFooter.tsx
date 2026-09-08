/* eslint-disable no-unused-vars */
import { Group, Pagination, Table, Text } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

type Props = {
	total: number;
	page: number;
	pageSize: number;
	setPage: (page: number) => void;
};

export const TableFooter = ({ total, page, pageSize, setPage }: Props) => {
	const hasPagination = total > pageSize;

	return (
		<Table.Tfoot
			style={{
				borderTop: '1px solid var(--mantine-color-gray-3)',
				backgroundColor: 'var(--mantine-color-gray-0)',
			}}
		>
			<Table.Tr>
				<Table.Td colSpan={6} fw={700} className={stickyStyles.stickyLeft}>
					<Group justify="space-between">
						<Text fz="sm">Total: {total}</Text>
						{hasPagination && (
							<Pagination
								total={Math.ceil(total / pageSize)}
								value={page}
								onChange={setPage}
							/>
						)}
					</Group>
				</Table.Td>
				<Table.Td className={stickyStyles.stickyRight} />
			</Table.Tr>
		</Table.Tfoot>
	);
};
