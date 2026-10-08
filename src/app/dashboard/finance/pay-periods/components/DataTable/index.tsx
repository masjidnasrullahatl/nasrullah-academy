import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { PayPeriodStatus } from '@prisma/client';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { DEFAULT_PAGE_SIZE } from '@components/TablePagination';

import { useGetPagingPayPeriods } from '@hooks/react-query/pay-periods/useGetPagingPayPeriods';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { PayPeriodFormModal } from '../PayPeriodFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export const DataTable = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [filter, setFilter] = useState<{ keyword?: string; status?: PayPeriodStatus }>({});

	const {
		data: payPeriods,
		isLoading,
		isError,
		error,
	} = useGetPagingPayPeriods({
		page,
		limit: pageSize,
		keyword: filter.keyword,
		status: filter.status,
	});

	const { data: teachers } = useGetPagingTeachers({
		page: 1,
		limit: 500,
		status: 'ACTIVE',
	});

	const totalTeachersWithClasses =
		teachers?.data.filter((teacher) => teacher.programs.length > 0).length || 0;

	const handleChangeFilter = (key: 'keyword' | 'status', value: string) => {
		setFilter((prev) => ({
			...prev,
			[key]: value || undefined,
		}));
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			title: 'Create Pay Period',
			size: 'lg',
			children: <PayPeriodFormModal />,
		});
	};

	const rows = payPeriods?.data.map((payPeriod, index) => (
		<TableRow
			key={payPeriod.id}
			payPeriod={payPeriod}
			index={index}
			page={page}
			pageSize={pageSize}
			totalTeachersWithClasses={totalTeachersWithClasses}
		/>
	));

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
					Create Pay Period
				</Button>
			</Group>

			<Table.ScrollContainer minWidth={950}>
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
						{isLoading ? <LoadingBody pageSize={pageSize} /> : rows?.length ? rows : <EmptyBody />}
					</Table.Tbody>
					<TableFooter
						total={payPeriods?.total || 0}
						page={page}
						pageSize={pageSize}
						setPage={setPage}
						setPageSize={setPageSize}
					/>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
