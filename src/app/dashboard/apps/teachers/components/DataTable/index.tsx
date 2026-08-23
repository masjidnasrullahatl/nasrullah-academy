import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { TeacherFormModal } from '../TeacherFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export const DataTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{ keyword?: string; status?: string }>(
		{},
	);

	const {
		data: teachers,
		isLoading,
		isError,
		error,
	} = useGetPagingTeachers({
		page,
		limit: 10,
		keyword: filter.keyword,
		status: filter.status as any,
	});

	const handleChangeFilter = (key: 'keyword' | 'status', value: string) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			size: 'lg',
			title: 'Create Teacher',
			children: <TeacherFormModal />,
		});
	};

	const rows = teachers?.data.map((teacher, index) => (
		<TableRow key={teacher.id} teacher={teacher} page={page} index={index} />
	));

	const hasData = Boolean(teachers?.total);

	return (
		<Paper p="md">
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
					Create Teacher
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
						total={teachers?.total || 0}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
