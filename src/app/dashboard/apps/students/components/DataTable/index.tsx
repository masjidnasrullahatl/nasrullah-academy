import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { useGetPagingStudents } from '@hooks/react-query/students/useGetPagingStudents';

import { StudentFormModal } from '../StudentFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export const DataTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		keyword?: string;
		familyId?: string;
		classId?: string;
		gender?: string;
		status?: string;
	}>({});

	const {
		data: students,
		isLoading,
		isError,
		error,
	} = useGetPagingStudents({
		page,
		limit: 10,
		keyword: filter.keyword,
		familyId: filter.familyId,
		classId: filter.classId,
		gender: filter.gender as any,
		status: filter.status as any,
	});

	const handleChangeFilter = (
		key: 'keyword' | 'familyId' | 'classId' | 'gender' | 'status',
		value: string,
	) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			title: 'Create Student',
			size: 'lg',
			children: <StudentFormModal />,
		});
	};

	const rows = students?.data.map((student, index) => (
		<TableRow key={student.id} student={student} page={page} index={index} />
	));

	const hasData = Boolean(students?.total);

	return (
		<Paper p="md">
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md" wrap="nowrap">
				<Box flex={1}>
					<TableFilter onChangeFilter={handleChangeFilter} />
				</Box>

				<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
					New Student
				</Button>
			</Group>

			<Group justify="flex-end" mb="sm"></Group>

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
						total={students?.total || 0}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
