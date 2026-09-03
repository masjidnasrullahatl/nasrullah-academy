import { Group, Pagination, Table, Text } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

import { formatMoney } from '@utils/money';

type Props = {
	total: number;
	page: number;
	pageSize: number;
	summary: {
		studentCount: number;
		totalDue: number;
		totalPaid: number;
		balance: number;
	};
	// eslint-disable-next-line no-unused-vars
	setPage: (page: number) => void;
};

export const TableFooter = ({
	total,
	page,
	pageSize,
	summary,
	setPage,
}: Props) => {
	const hasPagination = total > pageSize;

	return (
		<Table.Tfoot
			style={{
				borderTop: '1px solid var(--mantine-color-gray-3)',
				backgroundColor: 'var(--mantine-color-gray-0)',
			}}
		>
			<Table.Tr>
				<Table.Td
					colSpan={3}
					fw={700}
					className={stickyStyles.stickyLeft}
					bg="gray.0"
				>
					Sum:
				</Table.Td>

				<Table.Td ta="center" fz="sm" fw={700} c="blue">
					{summary.studentCount}
				</Table.Td>

				<Table.Td ta="right" fz="sm" fw={700} c="red">
					{formatMoney(summary.totalDue)}
				</Table.Td>

				<Table.Td ta="right" fz="sm" fw={700} c="green">
					{formatMoney(summary.totalPaid)}
				</Table.Td>

				<Table.Td ta="right">
					<Text
						span
						fz="sm"
						fw={700}
						c={summary.balance > 0 ? 'red.7' : 'green.7'}
					>
						{formatMoney(summary.balance)}
					</Text>
				</Table.Td>

				<Table.Td colSpan={3} className={stickyStyles.stickyRight} />
			</Table.Tr>

			<Table.Tr>
				<Table.Td colSpan={9} fw={700} className={stickyStyles.stickyLeft}>
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
