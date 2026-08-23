import { useState } from 'react';

import {
	ActionIcon,
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
	Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';

import stickyStyles from '@styles/sticky-table.module.css';
import {
	IconAlertCircle,
	IconChalkboard,
	IconCircleDot,
	IconMoodEmpty,
	IconSearch,
	IconUsers,
} from '@tabler/icons-react';

import {
	ARCHIVE_STATUS_COLORS,
	ARCHIVE_STATUS_LABELS,
	ARCHIVE_STATUS_OPTIONS,
} from '@configs/enums';

import {
	ClassRow,
	useGetPagingClasses,
} from '@hooks/react-query/classes/useGetPagingClasses';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { AssignTeacherModal } from './AssignTeacherModal';
import { ClassActionsMenu } from './ClassActionsMenu';
import { ClassStudentsModal } from './ClassStudentsModal';

export const ClassesTable = () => {
	const limit = 20;

	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		keyword?: string;
		teacherId?: string;
		status?: 'ACTIVE' | 'ARCHIVED';
	}>({});

	const {
		data: classes,
		isLoading,
		isError,
		error,
	} = useGetPagingClasses({
		page,
		limit,
		keyword: filter.keyword,
		teacherId: filter.teacherId,
		status: filter.status,
	});

	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });

	const handleChangeFilter = (
		key: 'keyword' | 'teacherId' | 'status',
		value: string | undefined,
	) => {
		setFilter((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value || undefined);
	}, 500);

	const openAssignTeacher = (classItem: ClassRow) => {
		modals.open({
			title: `Assign teacher to ${classItem.name}`,
			size: 'md',
			children: <AssignTeacherModal classId={classItem.id} />,
		});
	};

	const openStudents = (classItem: ClassRow) => {
		modals.open({
			title: `Students — ${classItem.name}`,
			size: 'xl',
			children: <ClassStudentsModal classId={classItem.id} />,
		});
	};

	const loadingRows = Array.from({ length: 8 }).map((_, index) => (
		<Table.Tr key={index}>
			{Array.from({ length: 9 }).map((_, columnIndex) => (
				<Table.Td
					key={columnIndex}
					className={
						columnIndex === 0
							? stickyStyles.stickyLeft
							: columnIndex === 8
								? stickyStyles.stickyRight
								: undefined
					}
				>
					<Skeleton h={28} />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const rows = classes?.data.map((classItem, index) => (
		<Table.Tr key={classItem.id}>
			<Table.Td className={stickyStyles.stickyLeft}>
				{(page - 1) * limit + index + 1}
			</Table.Td>
			<Table.Td>{classItem.name}</Table.Td>
			<Table.Td>
				{classItem.teacher
					? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
					: '-'}
			</Table.Td>
			<Table.Td ta="center">{classItem.studentCount}</Table.Td>
			<Table.Td ta="center">{classItem.boysCount}</Table.Td>
			<Table.Td ta="center">{classItem.girlsCount}</Table.Td>
			<Table.Td>
				<Badge color={ARCHIVE_STATUS_COLORS[classItem.status]}>
					{ARCHIVE_STATUS_LABELS[classItem.status]}
				</Badge>
			</Table.Td>
			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Assign teacher">
						<ActionIcon onClick={() => openAssignTeacher(classItem)}>
							<IconChalkboard size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="View students">
						<ActionIcon color="teal" onClick={() => openStudents(classItem)}>
							<IconUsers size={16} />
						</ActionIcon>
					</Tooltip>
					<ClassActionsMenu classItem={classItem} />
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(classes?.total);
	const hasPagination = (classes?.total || 0) > limit;

	return (
		<Paper p="md" withBorder>
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md" wrap="nowrap">
				<Input
					leftSection={<IconSearch size={16} />}
					placeholder="Search class name"
					style={{ flex: 1 }}
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>

				<Select
					placeholder="Teacher"
					leftSection={<IconChalkboard size={16} />}
					clearable
					searchable
					data={teachers?.data.map((teacher) => ({
						value: teacher.id,
						label: `${teacher.firstName} ${teacher.lastName}`,
					}))}
					onChange={(value) =>
						handleChangeFilter('teacherId', value || undefined)
					}
				/>
				<Select
					placeholder="Status"
					leftSection={<IconCircleDot size={16} />}
					clearable
					data={ARCHIVE_STATUS_OPTIONS}
					onChange={(value) => handleChangeFilter('status', value || undefined)}
				/>
			</Group>

			<Table.ScrollContainer minWidth={1000}>
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
							<Table.Th>Class</Table.Th>
							<Table.Th>Teacher</Table.Th>
							<Table.Th ta="center">Students</Table.Th>
							<Table.Th ta="center">Boys</Table.Th>
							<Table.Th ta="center">Girls</Table.Th>
							<Table.Th>Status</Table.Th>
							<Table.Th ta="center" className={stickyStyles.stickyRight}>
								Actions
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{isLoading ? (
							loadingRows
						) : hasData ? (
							rows
						) : (
							<Table.Tr>
								<Table.Td className={stickyStyles.stickyLeft} />
								<Table.Td colSpan={6}>
									<Center h={220}>
										<Stack align="center">
											<IconMoodEmpty
												size={40}
												color="var(--theme-primary-color)"
											/>
											<Text fw={600}>No classes found</Text>
										</Stack>
									</Center>
								</Table.Td>
								<Table.Td className={stickyStyles.stickyRight} />
							</Table.Tr>
						)}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>

			{hasPagination && (
				<Group justify="flex-end" mt="md">
					<Pagination
						total={Math.ceil((classes?.total || 0) / limit)}
						value={page}
						onChange={setPage}
					/>
				</Group>
			)}
		</Paper>
	);
};
