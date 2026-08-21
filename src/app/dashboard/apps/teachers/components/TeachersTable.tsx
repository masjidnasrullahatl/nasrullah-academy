import { useState } from 'react';

import {
	ActionIcon,
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
import { notifications } from '@mantine/notifications';

import {
	IconAlertCircle,
	IconEdit,
	IconMoodEmpty,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';

import { RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useDeleteTeacher } from '@hooks/react-query/teachers/useDeleteTeacher';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { formatMoney } from '@utils/money';

import { TeacherFormModal } from './TeacherFormModal';

export const TeachersTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{ keyword?: string; status?: string }>({});
	const [deleteError, setDeleteError] = useState('');

	const {
		data: teachers,
		isLoading,
		isError,
		error,
	} = useGetPagingTeachers({
		page,
		limit: 10,
		keyword: filter.keyword,
		status: filter.status as any,
	});

	const { mutateAsync: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();

	const handleChangeFilter = (key: 'keyword' | 'status', value: string) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value);
	}, 500);

	const handleCreate = () => {
		modals.open({
			title: 'Create Teacher',
			children: <TeacherFormModal />,
			size: 'lg',
		});
	};

	const handleEdit = (teacher: any) => {
		modals.open({
			title: 'Edit Teacher',
			children: <TeacherFormModal teacher={teacher} />,
			size: 'lg',
		});
	};

	const handleDelete = (teacher: any) => {
		modals.openConfirmModal({
			title: `Delete teacher ${teacher.firstName} ${teacher.lastName}?`,
			children: 'This removes the teacher profile and unassigns related classes.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					setDeleteError('');
					await deleteTeacher({ id: teacher.id });
					notifications.show({
						title: 'Teacher deleted',
						message: 'Teacher deleted successfully',
						color: 'green',
					});
				} catch (error: any) {
					setDeleteError(error.message);
				}
			},
		});
	};

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
						<ActionIcon variant="filled" size="lg" onClick={handleCreate}>
							<IconPlus size={18} />
						</ActionIcon>
					</Stack>
				</Center>
			</Table.Td>
		</Table.Tr>
	);

	const rows = teachers?.data.map((teacher, index) => (
		<Table.Tr key={teacher.id}>
			<Table.Td>{(page - 1) * 10 + index + 1}</Table.Td>
			<Table.Td>{`${teacher.firstName} ${teacher.lastName}`}</Table.Td>
			<Table.Td>{teacher.phoneNumber || '-'}</Table.Td>
			<Table.Td>{teacher.email || '-'}</Table.Td>
			<Table.Td>{teacher.zelleId || '-'}</Table.Td>
			<Table.Td>{formatMoney(Number(teacher.hourlyRate || 0))}</Table.Td>
			<Table.Td>
				<Group gap={4}>
					{teacher.classes.map((classItem) => (
						<Badge key={classItem.id} variant="light">
							{classItem.name}
						</Badge>
					))}
				</Group>
			</Table.Td>
			<Table.Td ta="center">
				<Badge color={teacher.status === 'ACTIVE' ? 'green' : 'gray'}>
					{teacher.status}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" justify="center">
					<ActionIcon onClick={() => handleEdit(teacher)}>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon color="red" onClick={() => handleDelete(teacher)}>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(teachers?.total);
	const hasPagination = (teachers?.total || 0) > 10;

	return (
		<Paper p="md">
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			{deleteError && (
				<Alert color="red" mb="md">
					{deleteError}
				</Alert>
			)}

			<Group mb="md" justify="end" w="100%" wrap="wrap">
				<Input
					flex={1}
					leftSection={<IconSearch size={16} />}
					placeholder="Search by name, phone, email or Zelle"
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>
				<Select
					placeholder="Status"
					data={RECORD_STATUS_OPTIONS}
					onChange={(value) => handleChangeFilter('status', value || '')}
					clearable
				/>
			</Group>

			<Table.ScrollContainer minWidth={1300}>
				<Table bg="white" border={1}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>#</Table.Th>
						<Table.Th>Name</Table.Th>
						<Table.Th>Phone</Table.Th>
						<Table.Th>Email</Table.Th>
						<Table.Th>Zelle ID</Table.Th>
						<Table.Th>Hourly Rate</Table.Th>
						<Table.Th>Classes</Table.Th>
						<Table.Th ta="center">Status</Table.Th>
						<Table.Th ta="center">Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{isLoading ? loadingRows : hasData ? rows : emptyRows}</Table.Tbody>
				<Table.Tfoot>
					<Table.Tr>
						<Table.Td colSpan={9}>
							<Group justify="space-between">
								<Text>Total: {teachers?.total || 0}</Text>
								{hasPagination && (
									<Pagination
										total={Math.ceil((teachers?.total || 0) / 10)}
										value={page}
										onChange={setPage}
									/>
								)}
							</Group>
						</Table.Td>
					</Table.Tr>
				</Table.Tfoot>
				</Table>
			</Table.ScrollContainer>

			<Group justify="flex-end" mt="md">
				<Button onClick={handleCreate} loading={isDeleting}>
					Create Teacher
				</Button>
			</Group>
		</Paper>
	);
};
