import Link from 'next/link';

import { useState } from 'react';

import {
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

import { IconMoodEmpty, IconSearch } from '@tabler/icons-react';

import { RECORD_STATUS_OPTIONS } from '@configs/enums';
import { PATH_APPS } from '@configs/routes';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { FamilyActionsColumn } from './FamilyActionsColumn';

export const FamiliesTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		keyword?: string;
		status?: string;
		programId?: string;
	}>({});

	const { data: families, isLoading } = useGetPagingFamilies({
		page,
		limit: 10,
		keyword: filter.keyword,
		status: filter.status as any,
		programId: filter.programId,
	});

	const { data: programs } = useGetPagingPrograms({
		page: 1,
		limit: 100,
	});

	const handleChangeFilter = (
		key: 'keyword' | 'status' | 'programId',
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
			{Array.from({ length: 9 }).map((_, columnIndex) => (
				<Table.Td key={columnIndex}>
					<Skeleton h={30} w="100%" />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const emptyRows = (
		<Table.Tr>
			<Table.Td colSpan={9}>
				<Center h={260}>
					<Stack justify="center" align="center">
						<IconMoodEmpty size={40} color="var(--theme-primary-color)" />
						<Text fw="semibold">No data found</Text>
					</Stack>
				</Center>
			</Table.Td>
		</Table.Tr>
	);

	const rows = families?.data.map((family, index) => (
		<Table.Tr key={family.id}>
			<Table.Td>{(page - 1) * 10 + index + 1}</Table.Td>
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
					label={family.students.map((student: any) => `${student.firstName} ${student.lastName}`).join(', ')}
					disabled={!family.students.length}
				>
					<Text>{family.studentCount}</Text>
				</Tooltip>
			</Table.Td>
			<Table.Td ta="center">{family.boysCount}</Table.Td>
			<Table.Td ta="center">{family.girlsCount}</Table.Td>
			<Table.Td ta="center">
				<Badge color={family.status === 'ACTIVE' ? 'green' : 'gray'}>
					{family.status}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Text size="sm" lineClamp={1}>
					{family.notes}
				</Text>
			</Table.Td>
			<Table.Td ta="center">
				<FamilyActionsColumn family={family} />
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(families?.total);
	const hasPagination = (families?.total || 0) > 10;

	return (
		<Paper p="md">
			<Group mb="md" justify="end" w="100%">
				<Input
					flex={1}
					leftSection={<IconSearch size={16} />}
					placeholder="Search by family name, parent name, phone, email, ..."
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>

				<Select
					placeholder="Filter by status"
					data={RECORD_STATUS_OPTIONS}
					onChange={(value) => handleChangeFilter('status', value || '')}
					clearable
				/>

				<Select
					placeholder="Filter by program"
					data={programs?.data.map((program) => ({
						value: program.id,
						label: program.name,
					}))}
					onChange={(value) => handleChangeFilter('programId', value || '')}
					clearable
					searchable
				/>
			</Group>

			<Table bg="white" border={1}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>#</Table.Th>
						<Table.Th>Family / Parent Name</Table.Th>
						<Table.Th>Phone Number</Table.Th>
						<Table.Th ta="center">Students</Table.Th>
						<Table.Th ta="center">Boys</Table.Th>
						<Table.Th ta="center">Girls</Table.Th>
						<Table.Th ta="center">Status</Table.Th>
						<Table.Th>Notes</Table.Th>
						<Table.Th ta="center">Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{isLoading ? loadingRows : hasData ? rows : emptyRows}</Table.Tbody>
				<Table.Tfoot>
					<Table.Tr>
						<Table.Td colSpan={9}>
							<Group justify="space-between">
								<Text>Total: {families?.total || 0}</Text>
								{hasPagination && (
									<Pagination
										total={Math.ceil((families?.total || 0) / 10)}
										value={page}
										onChange={setPage}
									/>
								)}
							</Group>
						</Table.Td>
					</Table.Tr>
				</Table.Tfoot>
			</Table>
		</Paper>
	);
};
