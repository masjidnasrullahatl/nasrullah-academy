import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';

import { ClassFormModal } from '../ClassFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

const PAGE_SIZE = 20;

export const DataTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		keyword?: string;
		teacherId?: string;
		programId?: string;
		status?: 'ACTIVE' | 'ARCHIVED';
	}>({});

	const {
		data: classes,
		isLoading,
		isError,
		error,
	} = useGetPagingClasses({
		page,
		limit: PAGE_SIZE,
		keyword: filter.keyword,
		teacherId: filter.teacherId,
		programId: filter.programId,
		status: filter.status,
	});

	const handleChangeFilter = (
		key: 'keyword' | 'teacherId' | 'programId' | 'status',
		value: string,
	) => {
		setFilter((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			title: 'Create Class',
			size: 'md',
			children: <ClassFormModal />,
		});
	};

	const rows = classes?.data.map((classItem, index) => (
		<TableRow
			key={classItem.id}
			classItem={classItem}
			page={page}
			index={index}
			pageSize={PAGE_SIZE}
		/>
	));

	const hasData = Boolean(classes?.total);

	return (
		<Paper p="md" withBorder>
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md">
				<Box flex={1}>
					<TableFilter onChangeFilter={handleChangeFilter} />
				</Box>

				<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
					Create class
				</Button>
			</Group>

			<Table.ScrollContainer minWidth={1000}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="sm"
					horizontalSpacing="md"
				>
					<TableHeader />

					<Table.Tbody>
						{isLoading ? <LoadingBody /> : hasData ? rows : <EmptyBody />}
					</Table.Tbody>

					<TableFooter
						page={page}
						setPage={setPage}
						total={classes?.total || 0}
						pageSize={PAGE_SIZE}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
