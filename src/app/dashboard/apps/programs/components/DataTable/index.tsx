import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { ProgramFormModal } from '../ProgramFormModal';

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
		status?: 'ACTIVE' | 'ARCHIVED';
	}>({});

	const {
		data: programs,
		isLoading,
		isError,
		error,
	} = useGetPagingPrograms({
		page,
		limit: PAGE_SIZE,
		keyword: filter.keyword,
		status: filter.status,
	});

	const handleChangeFilter = (key: 'keyword' | 'status', value: string) => {
		setFilter((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			title: 'Create Program',
			size: 'lg',
			children: <ProgramFormModal />,
		});
	};

	const rows = programs?.data.map((program, index) => (
		<TableRow
			key={program.id}
			program={program}
			page={page}
			index={index}
			pageSize={PAGE_SIZE}
		/>
	));

	const hasData = Boolean(programs?.total);

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
					Create Program
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
						total={programs?.total || 0}
						page={page}
						setPage={setPage}
						pageSize={PAGE_SIZE}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
