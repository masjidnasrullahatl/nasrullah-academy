import { Group, Pagination, Table, Text } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

type Props = {
	total: number;
	page: number;
	// eslint-disable-next-line no-unused-vars
	setPage: (page: number) => void;
	pageSize: number;
};

export const TableFooter = ({ total, page, setPage, pageSize }: Props) => {
	const hasPagination = total > pageSize;

	return (
		<Table.Tfoot
			style={{
				borderTop: '2px solid var(--mantine-color-gray-3)',
				backgroundColor: 'var(--mantine-color-gray-0)',
			}}
		>
			<Table.Tr>
				<Table.Td colSpan={7} fw={700} className={stickyStyles.stickyLeft}>
					<Group justify="space-between">
						<Text fz="sm">Total: {total}</Text>

						{hasPagination && (
							<Pagination
								fw={500}
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
