import { useState } from 'react';

import { Alert, Button, Grid, Group, Paper, Table, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus } from '@tabler/icons-react';

import { useGetPagingInvoices } from '@hooks/react-query/invoices/useGetPagingInvoices';

import { formatMoney } from '@utils/money';

import { GenerateMonthButton } from '../GenerateMonthButton';
import { PaymentFormModal } from '../PaymentFormModal';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableFilter } from './TableFilter';
import { TableFooter } from './TableFooter';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

const PAGE_SIZE = 20;

export const DataTable = () => {
	const currentDate = new Date();
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		year: number;
		month: number;
		paymentStatus?: string;
		payMethod?: string;
		familyId?: string;
		keyword?: string;
	}>({
		year: currentDate.getFullYear(),
		month: currentDate.getMonth() + 1,
	});

	const {
		data: invoices,
		isLoading,
		isError,
		error,
	} = useGetPagingInvoices({
		page,
		limit: PAGE_SIZE,
		year: filter.year,
		month: filter.month,
		paymentStatus: filter.paymentStatus as any,
		payMethod: filter.payMethod as any,
		familyId: filter.familyId,
		keyword: filter.keyword,
	});

	const handleChangeFilter = (
		key: 'year' | 'month' | 'familyId' | 'payMethod' | 'paymentStatus' | 'keyword',
		value: string | number,
	) => {
		setFilter((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const handleCreate = () => {
		modals.open({
			title: 'Create Monthly Payment',
			size: 'xl',
			children: <PaymentFormModal defaultYear={filter.year} defaultMonth={filter.month} />,
		});
	};

	const rows = invoices?.data.map((invoice, index) => (
		<TableRow
			key={invoice.id}
			invoice={invoice}
			page={page}
			index={index}
			pageSize={PAGE_SIZE}
		/>
	));

	const hasData = Boolean(invoices?.total);

	return (
		<>
			<Grid>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Students
						</Text>
						<Text fw={700} size="lg">
							{invoices?.summary.studentCount || 0}
						</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Total Due
						</Text>
						<Text fw={700} size="lg">
							{formatMoney(invoices?.summary.totalDue || 0)}
						</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Total Paid
						</Text>
						<Text fw={700} size="lg">
							{formatMoney(invoices?.summary.totalPaid || 0)}
						</Text>
					</Paper>
				</Grid.Col>
				<Grid.Col span={{ base: 12, md: 3 }}>
					<Paper p="md" withBorder>
						<Text c="dimmed" size="sm">
							Balance
						</Text>
						<Text fw={700} size="lg">
							{formatMoney(invoices?.summary.balance || 0)}
						</Text>
					</Paper>
				</Grid.Col>
			</Grid>

			<Paper p="md" withBorder>
				{isError && (
					<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
						{error.message}
					</Alert>
				)}

				<TableFilter
					currentDate={currentDate}
					filter={filter}
					onChangeFilter={handleChangeFilter}
				/>

				<Group justify="flex-end" mb="sm" wrap="wrap">
					<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
						Add payment row
					</Button>
					<GenerateMonthButton year={filter.year} month={filter.month} />
				</Group>

				<Table.ScrollContainer minWidth={1050}>
					<Table
						striped="even"
						highlightOnHover
						withTableBorder
						verticalSpacing="sm"
						horizontalSpacing="md"
					>
						<TableHeader />

						<Table.Tbody>
							{isLoading ? (
								<LoadingBody pageSize={PAGE_SIZE} />
							) : hasData ? (
								rows
							) : (
								<EmptyBody />
							)}
						</Table.Tbody>

						<TableFooter
							total={invoices?.total || 0}
							page={page}
							setPage={setPage}
							pageSize={PAGE_SIZE}
							summary={{
								studentCount: invoices?.summary.studentCount || 0,
								totalDue: invoices?.summary.totalDue || 0,
								totalPaid: invoices?.summary.totalPaid || 0,
								balance: invoices?.summary.balance || 0,
							}}
						/>
					</Table>
				</Table.ScrollContainer>
			</Paper>
		</>
	);
};
