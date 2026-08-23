import Link from 'next/link';

import { useState } from 'react';

import {
	Alert,
	Anchor,
	Badge,
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
	Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import stickyStyles from '@styles/sticky-table.module.css';
import {
	IconAlertCircle,
	IconCircleDot,
	IconMoodEmpty,
	IconSearch,
} from '@tabler/icons-react';

import { RECORD_STATUS_OPTIONS } from '@configs/enums';
import { PATH_APPS } from '@configs/routes';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';

import { FamilyActionsColumn } from './FamilyActionsColumn';

export const FamiliesTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		keyword?: string;
		status?: string;
	}>({});

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

	const handleChangeFilter = (
		key: 'keyword' | 'status',
		value: string,
	) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value);
	}, 500);

	const loadingRows = Array.from({ length: 10 }).map((_, index) => (
		<Table.Tr key={index}>
			{Array.from({ length: 8 }).map((_, columnIndex) => (
				<Table.Td
					key={columnIndex}
					className={
						columnIndex === 0
							? stickyStyles.stickyLeft
							: columnIndex === 7
								? stickyStyles.stickyRight
								: undefined
					}
				>
					<Skeleton h={30} w="100%" />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const emptyRows = (
		<Table.Tr>
			<Table.Td className={stickyStyles.stickyLeft} />
			<Table.Td colSpan={6}>
				<Center h={260}>
					<Stack justify="center" align="center">
						<IconMoodEmpty size={40} color="var(--theme-primary-color)" />
						<Text fw="semibold">No data found</Text>
					</Stack>
				</Center>
			</Table.Td>
			<Table.Td className={stickyStyles.stickyRight} />
		</Table.Tr>
	);

	const getCountCell = (value: number, color: 'dark' | 'blue' | 'red') => {
		if (value === 0) {
			return <Text c="dimmed">0</Text>;
		}

		return (
			<Badge variant="light" color={color}>
				{value}
			</Badge>
		);
	};

	const rows = families?.data.map((family, index) => (
		<Table.Tr key={family.id}>
			<Table.Td className={stickyStyles.stickyLeft}>{(page - 1) * 10 + index + 1}</Table.Td>
			<Table.Td>
				<Anchor component={Link} href={`${PATH_APPS.families}/${family.id}`}>
					{family.name}
				</Anchor>
			</Table.Td>
			<Table.Td>
				<Stack gap={0}>
					<Text size="sm">{family.primaryPhone}</Text>
					{family.secondaryPhone && (
						<Text size="xs" c="dimmed">
							{family.secondaryPhone}
						</Text>
					)}
				</Stack>
			</Table.Td>
			<Table.Td ta="center">
				<Tooltip
					label={family.students
						.map((student: any) => `${student.firstName} ${student.lastName}`)
						.join(', ')}
					disabled={!family.students.length}
				>
					{getCountCell(family.studentCount, 'dark')}
				</Tooltip>
			</Table.Td>
			<Table.Td ta="center">{getCountCell(family.boysCount, 'blue')}</Table.Td>
			<Table.Td ta="center">{getCountCell(family.girlsCount, 'red')}</Table.Td>
			<Table.Td ta="center">
				<Badge color={family.status === 'ACTIVE' ? 'green' : 'gray'}>
					{family.status}
				</Badge>
			</Table.Td>
			<Table.Td ta="center" className={stickyStyles.stickyRight}>
				<FamilyActionsColumn family={family} />
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(families?.total);
	const hasPagination = (families?.total || 0) > 10;

	return (
		<Paper p="md">
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md" justify="end" w="100%" wrap="wrap">
				<Input
					flex={1}
					leftSection={<IconSearch size={16} />}
					placeholder="Search by family name, parent name, phone, email, ..."
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>

				<Select
					placeholder="Filter by status"
					leftSection={<IconCircleDot size={16} />}
					data={RECORD_STATUS_OPTIONS}
					onChange={(value) => handleChangeFilter('status', value || '')}
					clearable
				/>

			</Group>

			<Table.ScrollContainer minWidth={1200}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					verticalSpacing="sm"
					horizontalSpacing="md"
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th className={stickyStyles.stickyLeft}>#</Table.Th>
							<Table.Th>Family / Parent Name</Table.Th>
							<Table.Th>Phone Number</Table.Th>
							<Table.Th ta="center">Students</Table.Th>
							<Table.Th ta="center">Boys</Table.Th>
							<Table.Th ta="center">Girls</Table.Th>
							<Table.Th ta="center">Status</Table.Th>
							<Table.Th ta="center" className={stickyStyles.stickyRight}>
								Actions
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{isLoading ? loadingRows : hasData ? rows : emptyRows}</Table.Tbody>
					<Table.Tfoot
						style={{
							borderTop: '2px solid var(--mantine-color-gray-3)',
							backgroundColor: 'var(--mantine-color-gray-0)',
						}}
					>
						<Table.Tr>
							<Table.Td colSpan={7} fw={700} className={stickyStyles.stickyLeft}>
								<Group justify="space-between">
									<Text fw={700}>Total: {families?.total || 0}</Text>
									{hasPagination && (
										<Pagination
											total={Math.ceil((families?.total || 0) / 10)}
											value={page}
											onChange={setPage}
										/>
									)}
								</Group>
							</Table.Td>
							<Table.Td className={stickyStyles.stickyRight} />
						</Table.Tr>
					</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
