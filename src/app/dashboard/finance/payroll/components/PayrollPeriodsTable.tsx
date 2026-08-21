import { useState } from 'react';

import {
	Alert,
	Badge,
	Button,
	Center,
	Group,
	Input,
	Pagination,
	Paper,
	Select,
	Skeleton,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconMoodEmpty, IconPlus, IconSearch } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { MONTH_OPTIONS, PAYROLL_STATUS_COLORS, PAYROLL_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingPayrollPeriods } from '@hooks/react-query/payroll/useGetPagingPayrollPeriods';

import { formatMoney } from '@utils/money';

import { PayrollPeriodActionsColumn } from './PayrollPeriodActionsColumn';
import { PayrollPeriodFormModal } from './PayrollPeriodFormModal';

type PayrollPeriodsTableProps = {
	selectedPeriodId?: string;
	onSelectPeriod: any;
};

export const PayrollPeriodsTable = ({ selectedPeriodId, onSelectPeriod }: PayrollPeriodsTableProps) => {
	const currentYear = new Date().getFullYear();
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		year?: number;
		month?: number;
		status?: 'DRAFT' | 'PAID';
		keyword?: string;
	}>({});
	const {
		data: periods,
		isLoading,
		isError,
		error,
	} = useGetPagingPayrollPeriods({
		page,
		limit: 10,
		year: filter.year,
		month: filter.month,
		status: filter.status,
		keyword: filter.keyword,
	});

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		setFilter((prev) => ({ ...prev, keyword: value || undefined }));
		setPage(1);
	}, 500);

	const handleCreate = () => {
		modals.open({
			title: 'Create Payroll Period',
			size: 'lg',
			children: <PayrollPeriodFormModal />,
		});
	};

	const loadingRows = Array.from({ length: 10 }).map((_, index) => (
		<Table.Tr key={index}>
			{Array.from({ length: 9 }).map((__, cellIndex) => (
				<Table.Td key={cellIndex}>
					<Skeleton h={28} />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const rows = periods?.data.map((period, index) => (
		<Table.Tr
			key={period.id}
			onClick={() => onSelectPeriod(period.id)}
			style={{
				cursor: 'pointer',
				backgroundColor: selectedPeriodId === period.id ? 'var(--mantine-color-blue-0)' : undefined,
			}}
		>
			<Table.Td>{(page - 1) * 10 + index + 1}</Table.Td>
			<Table.Td>{period.label}</Table.Td>
			<Table.Td>
				{dayjs(period.startDate).format('MM/DD/YYYY')} - {dayjs(period.endDate).format('MM/DD/YYYY')}
			</Table.Td>
			<Table.Td ta="center">{period.teacherCount}</Table.Td>
			<Table.Td>{formatMoney(period.totalWeekdayPay)}</Table.Td>
			<Table.Td>{formatMoney(period.totalWeekendPay)}</Table.Td>
			<Table.Td>{formatMoney(period.totalPay)}</Table.Td>
			<Table.Td>
				<Badge color={PAYROLL_STATUS_COLORS[period.status]}>{period.status}</Badge>
			</Table.Td>
			<Table.Td onClick={(event) => event.stopPropagation()}>
				<PayrollPeriodActionsColumn period={period} />
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(periods?.total);
	const hasPagination = (periods?.total || 0) > 10;

	return (
		<Paper p="md" withBorder>
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md" justify="space-between">
				<Group wrap="wrap">
					<Select
						placeholder="Year"
						clearable
						data={Array.from({ length: 8 }).map((_, index) => {
							const year = currentYear - 2 + index;
							return { value: String(year), label: String(year) };
						})}
						onChange={(value) => {
							setFilter((prev) => ({ ...prev, year: value ? Number(value) : undefined }));
							setPage(1);
						}}
					/>
					<Select
						placeholder="Month"
						clearable
						data={MONTH_OPTIONS}
						onChange={(value) => {
							setFilter((prev) => ({ ...prev, month: value ? Number(value) : undefined }));
							setPage(1);
						}}
					/>
					<Select
						placeholder="Status"
						clearable
						data={PAYROLL_STATUS_OPTIONS}
						onChange={(value) => {
							setFilter((prev) => ({ ...prev, status: (value || undefined) as 'DRAFT' | 'PAID' | undefined }));
							setPage(1);
						}}
					/>
					<Input
						leftSection={<IconSearch size={16} />}
						placeholder="Search label"
						onChange={(event) => debounceChangeKeyword(event.currentTarget.value)}
					/>
				</Group>
				<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
					Create period
				</Button>
			</Group>

			<Table.ScrollContainer minWidth={1200}>
				<Table bg="white" border={1}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>#</Table.Th>
						<Table.Th>Label</Table.Th>
						<Table.Th>Period</Table.Th>
						<Table.Th>Teachers</Table.Th>
						<Table.Th>Weekday Pay</Table.Th>
						<Table.Th>Weekend Pay</Table.Th>
						<Table.Th>Total Pay</Table.Th>
						<Table.Th>Status</Table.Th>
						<Table.Th ta="center">Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{isLoading ? (
						loadingRows
					) : hasData ? (
						rows
					) : (
						<Table.Tr>
							<Table.Td colSpan={9}>
								<Center h={220}>
									<Stack align="center">
										<IconMoodEmpty size={40} color="var(--theme-primary-color)" />
										<Text fw={600}>No payroll periods found</Text>
										<Button variant="default" onClick={handleCreate}>
											Create period
										</Button>
									</Stack>
								</Center>
							</Table.Td>
						</Table.Tr>
					)}
				</Table.Tbody>
				</Table>
			</Table.ScrollContainer>

			{hasPagination && (
				<Group justify="flex-end" mt="md">
					<Pagination total={Math.ceil((periods?.total || 0) / 10)} value={page} onChange={setPage} />
				</Group>
			)}
		</Paper>
	);
};
