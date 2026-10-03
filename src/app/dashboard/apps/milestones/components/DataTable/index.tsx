import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { MilestoneType } from '@prisma/client';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { DEFAULT_PAGE_SIZE } from '@components/TablePagination';

import { useGetPagingMilestones } from '@hooks/react-query/milestones/useGetPagingMilestones';

import { MilestoneFormModal } from '../MilestoneFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export type MilestoneFilterKey = 'keyword' | 'programId' | 'type';

export const DataTable = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [filter, setFilter] = useState<{
		keyword?: string;
		programId?: string;
		type?: MilestoneType;
	}>({});

	const {
		data: milestones,
		isLoading,
		isError,
		error,
	} = useGetPagingMilestones({
		page,
		limit: pageSize,
		keyword: filter.keyword,
		programId: filter.programId,
		type: filter.type,
	});

	const handleChangeFilter = (key: MilestoneFilterKey, value: string) => {
		setFilter((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			title: 'Record Milestone',
			size: 'lg',
			children: <MilestoneFormModal />,
		});
	};

	const rows = milestones?.data.map((milestone, index) => (
		<TableRow
			key={milestone.id}
			milestone={milestone}
			page={page}
			index={index}
			pageSize={pageSize}
		/>
	));

	const hasData = Boolean(milestones?.total);

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
					Record Milestone
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
						total={milestones?.total || 0}
						page={page}
						setPage={setPage}
						pageSize={pageSize}
						setPageSize={setPageSize}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
