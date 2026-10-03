import { useState } from 'react';

import { Alert, Box, Button, Group, Paper, Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { MilestoneType } from '@prisma/client';
import {
	IconAlertCircle,
	IconFileTypePdf,
	IconPlus,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import { DEFAULT_PAGE_SIZE } from '@components/TablePagination';

import {
	MilestoneRow,
	useGetPagingMilestones,
} from '@hooks/react-query/milestones/useGetPagingMilestones';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { fetchAuth } from '@helpers/supabase/fetchAuth';

import { openPrintWindow } from '@utils/printReport';

import { buildMilestonesReport } from '../../reports';
import { MILESTONE_TYPE_OPTIONS } from '../../utils';
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
	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		null,
		null,
	]);
	const [isExporting, setIsExporting] = useState(false);

	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

	const dateFrom = dateRange[0]
		? dayjs(dateRange[0]).format('YYYY-MM-DD')
		: undefined;
	const dateTo = dateRange[1]
		? dayjs(dateRange[1]).format('YYYY-MM-DD')
		: undefined;

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
		dateFrom,
		dateTo,
	});

	const handleChangeFilter = (key: MilestoneFilterKey, value: string) => {
		setFilter((prev) => ({ ...prev, [key]: value || undefined }));
		setPage(1);
	};

	const handleChangeDateRange = (value: [Date | null, Date | null]) => {
		setDateRange(value);
		setPage(1);
	};

	// Exports every row matching the current filters, not just this page
	const handleExport = async () => {
		const report = openPrintWindow();
		setIsExporting(true);

		try {
			const queryParams = new URLSearchParams({
				page: '1',
				limit: '10000',
				keyword: filter.keyword || '',
				programId: filter.programId || '',
				type: filter.type || '',
				dateFrom: dateFrom || '',
				dateTo: dateTo || '',
			});

			const response = await fetchAuth(`/api/milestones?${queryParams}`);
			const result: { data: MilestoneRow[] } = await response.json();

			const filterLabels = [
				filter.programId &&
					`Program: ${programs?.data.find((item) => item.id === filter.programId)?.name}`,
				filter.type &&
					`Type: ${MILESTONE_TYPE_OPTIONS.find((item) => item.value === filter.type)?.label}`,
				(dateFrom || dateTo) &&
					`Dates: ${dateFrom ? dayjs(dateFrom).format('MM/DD/YYYY') : 'start'} to ${dateTo ? dayjs(dateTo).format('MM/DD/YYYY') : 'today'}`,
				filter.keyword && `Search: ${filter.keyword}`,
			].filter(Boolean) as string[];

			report.render(
				'Milestones Report',
				buildMilestonesReport(result.data, filterLabels),
			);
		} catch {
			report.close();
		} finally {
			setIsExporting(false);
		}
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
					<TableFilter
						onChangeFilter={handleChangeFilter}
						dateRange={dateRange}
						onChangeDateRange={handleChangeDateRange}
					/>
				</Box>

				<Button
					variant="default"
					leftSection={<IconFileTypePdf size={16} />}
					loading={isExporting}
					onClick={handleExport}
				>
					Export PDF
				</Button>

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
