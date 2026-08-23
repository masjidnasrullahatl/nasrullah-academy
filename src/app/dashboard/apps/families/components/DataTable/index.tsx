import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';

import { FamilyFormModal } from '../FamilyFormModal';

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
		data: families,
		isLoading,
		isError,
		error,
	} = useGetPagingFamilies({
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
			title: 'Create Family',
			size: 'xl',
			children: <FamilyFormModal />,
		});
	};

	const rows = families?.data.map((family, index) => (
		<TableRow key={family.id} family={family} page={page} index={index} />
	));

	const hasData = Boolean(families?.total);

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

				<Button onClick={handleCreate} leftSection={<IconPlus size={16} />}>
					New Family
				</Button>
			</Group>

			<Table.ScrollContainer minWidth={800}>
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
						total={families?.total || 0}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
