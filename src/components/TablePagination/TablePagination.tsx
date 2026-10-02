import { Group, Pagination, Select, Text } from '@mantine/core';

export const DEFAULT_PAGE_SIZE = 50;

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'];

type Props = {
	total: number;
	page: number;
	pageSize: number;
	// eslint-disable-next-line no-unused-vars
	setPage: (page: number) => void;
	// eslint-disable-next-line no-unused-vars
	setPageSize: (pageSize: number) => void;
};

export const TablePagination = ({
	total,
	page,
	pageSize,
	setPage,
	setPageSize,
}: Props) => {
	const hasPagination = total > pageSize;

	return (
		<Group justify="space-between">
			<Group gap="md">
				<Text fz="sm">Total: {total}</Text>

				<Group gap={6}>
					<Text fz="sm" fw={400} c="dimmed">
						Rows per page
					</Text>
					<Select
						size="xs"
						w={80}
						data={PAGE_SIZE_OPTIONS}
						value={String(pageSize)}
						allowDeselect={false}
						onChange={(value) => {
							setPageSize(Number(value));
							setPage(1);
						}}
					/>
				</Group>
			</Group>

			{hasPagination && (
				<Pagination
					total={Math.ceil(total / pageSize)}
					value={page}
					onChange={setPage}
				/>
			)}
		</Group>
	);
};
