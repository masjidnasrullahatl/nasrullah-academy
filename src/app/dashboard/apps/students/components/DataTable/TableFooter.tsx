import { Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

import { TablePagination } from '@components/TablePagination';

type Props = {
	total: number;
	pageSize: number;
	page: number;
	// eslint-disable-next-line no-unused-vars
	setPage: (page: number) => void;
	// eslint-disable-next-line no-unused-vars
	setPageSize: (pageSize: number) => void;
};

export const TableFooter = ({
	total,
	page,
	setPage,
	pageSize,
	setPageSize,
}: Props) => {
	return (
		<Table.Tfoot
			style={{
				borderTop: '2px solid var(--mantine-color-gray-3)',
				backgroundColor: 'var(--mantine-color-gray-0)',
			}}
		>
			<Table.Tr>
				<Table.Td colSpan={6} fw={700} className={stickyStyles.stickyLeft}>
					<TablePagination
						total={total}
						page={page}
						pageSize={pageSize}
						setPage={setPage}
						setPageSize={setPageSize}
					/>
				</Table.Td>

				<Table.Td className={stickyStyles.stickyRight} />
			</Table.Tr>
		</Table.Tfoot>
	);
};
