import { useMemo, useState } from 'react';

import {
	Alert,
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
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import stickyStyles from '@styles/sticky-table.module.css';
import {
	IconAlertCircle,
	IconCircleDot,
	IconGenderBigender,
	IconMoodEmpty,
	IconSchool,
	IconSearch,
	IconUsersGroup,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import { GENDER_OPTIONS, RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';
import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useGetPagingStudents } from '@hooks/react-query/students/useGetPagingStudents';

import { StudentActionsColumn } from './StudentActionsColumn';

export const StudentsTable = () => {
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

	const { data: families } = useGetPagingFamilies({
		page: 1,
		limit: 1000,
	});
	const { data: classes } = useGetPagingClasses({
		page: 1,
		limit: 1000,
	});

	const handleChangeFilter = (
		key: 'keyword' | 'familyId' | 'classId' | 'gender' | 'status',
		value: string,
	) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value);
	}, 500);

	const classOptions = useMemo(
		() =>
			classes?.data.map((item) => ({
				value: item.id,
				label: item.name,
			})) || [],
		[classes],
	);

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

	const rows = students?.data.map((student, index) => (
		<Table.Tr key={student.id}>
			<Table.Td className={stickyStyles.stickyLeft}>{(page - 1) * 10 + index + 1}</Table.Td>
			<Table.Td>{`${student.firstName} ${student.lastName}`}</Table.Td>
			<Table.Td>{student.family?.name}</Table.Td>
			<Table.Td>{student.gender}</Table.Td>
			<Table.Td>
				{student.dateOfBirth ? dayjs(student.dateOfBirth).format('MM/DD/YYYY') : '-'}
			</Table.Td>
			<Table.Td>
				<Group gap={4}>
					{student.enrollments.map((enrollment) => (
						<Badge key={enrollment.id} variant="light">
							{enrollment.class.name}
						</Badge>
					))}
				</Group>
			</Table.Td>
			<Table.Td ta="center">
				<Badge color={student.status === 'ACTIVE' ? 'green' : 'gray'}>{student.status}</Badge>
			</Table.Td>
			<Table.Td ta="center" className={stickyStyles.stickyRight}>
				<StudentActionsColumn student={student} />
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(students?.total);
	const hasPagination = (students?.total || 0) > 10;

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
					placeholder="Search by student name or family"
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>

				<Select
					placeholder="Family"
					leftSection={<IconUsersGroup size={16} />}
					data={families?.data.map((family) => ({
						value: family.id,
						label: family.name,
					}))}
					onChange={(value) => handleChangeFilter('familyId', value || '')}
					clearable
					searchable
				/>

				<Select
					placeholder="Class"
					leftSection={<IconSchool size={16} />}
					data={classOptions}
					onChange={(value) => handleChangeFilter('classId', value || '')}
					clearable
					searchable
				/>

				<Select
					placeholder="Gender"
					leftSection={<IconGenderBigender size={16} />}
					data={GENDER_OPTIONS}
					onChange={(value) => handleChangeFilter('gender', value || '')}
					clearable
				/>

				<Select
					placeholder="Status"
					leftSection={<IconCircleDot size={16} />}
					data={RECORD_STATUS_OPTIONS}
					onChange={(value) => handleChangeFilter('status', value || '')}
					clearable
				/>
			</Group>

			<Table.ScrollContainer minWidth={1300}>
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
							<Table.Th>Student Name</Table.Th>
							<Table.Th>Family</Table.Th>
							<Table.Th>Gender</Table.Th>
							<Table.Th>Date of Birth</Table.Th>
							<Table.Th>Class(es)</Table.Th>
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
									<Text fw={700}>Total: {students?.total || 0}</Text>
									{hasPagination && (
										<Pagination
											total={Math.ceil((students?.total || 0) / 10)}
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
