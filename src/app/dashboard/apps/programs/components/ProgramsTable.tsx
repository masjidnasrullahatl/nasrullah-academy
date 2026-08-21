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
	Tooltip,
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

import { ARCHIVE_STATUS_OPTIONS, PROGRAM_CODE_LABELS } from '@configs/enums';

import { useDeleteProgram } from '@hooks/react-query/programs/useDeleteProgram';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { ProgramFormModal } from './ProgramFormModal';

export const ProgramsTable = () => {
	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{ keyword?: string; status?: string }>({});
	const [deleteError, setDeleteError] = useState('');

	const {
		data: programs,
		isLoading,
		isError,
		error,
	} = useGetPagingPrograms({
		page,
		limit: 10,
		keyword: filter.keyword,
		status: filter.status as any,
	});

	const { mutateAsync: deleteProgram, isPending: isDeleting } = useDeleteProgram();

	const handleChangeFilter = (key: 'keyword' | 'status', value: string) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value);
	}, 500);

	const handleCreate = () => {
		modals.open({
			title: 'Create Program',
			children: <ProgramFormModal />,
		});
	};

	const handleEdit = (program: any) => {
		modals.open({
			title: 'Edit Program',
			children: <ProgramFormModal program={program} />,
		});
	};

	const handleDelete = (program: any) => {
		modals.openConfirmModal({
			title: `Delete program ${program.name}?`,
			children: 'This removes the program and related class/payment references.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					setDeleteError('');
					await deleteProgram({ id: program.id });
					notifications.show({
						title: 'Program deleted',
						message: 'Program deleted successfully',
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
			{Array.from({ length: 7 }).map((_, columnIndex) => (
				<Table.Td key={columnIndex}>
					<Skeleton h={30} w="100%" />
				</Table.Td>
			))}
		</Table.Tr>
	));

	const emptyRows = (
		<Table.Tr>
			<Table.Td colSpan={8}>
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

	const rows = programs?.data.map((program, index) => (
		<Table.Tr key={program.id}>
			<Table.Td>{(page - 1) * 10 + index + 1}</Table.Td>
			<Table.Td>{PROGRAM_CODE_LABELS[program.code]}</Table.Td>
			<Table.Td>{program.name}</Table.Td>
			<Table.Td>
				<Tooltip label={program.description} disabled={!program.description}>
					<Text lineClamp={1}>{program.description || '-'}</Text>
				</Tooltip>
			</Table.Td>
			<Table.Td ta="center">{program._count.classes}</Table.Td>
			<Table.Td ta="center">{program._count.enrollments}</Table.Td>
			<Table.Td ta="center">
				<Badge color={program.status === 'ACTIVE' ? 'green' : 'gray'}>
					{program.status}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Group gap="xs" justify="center">
					<ActionIcon onClick={() => handleEdit(program)}>
						<IconEdit size={16} />
					</ActionIcon>
					<ActionIcon color="red" onClick={() => handleDelete(program)}>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	const hasData = Boolean(programs?.total);
	const hasPagination = (programs?.total || 0) > 10;

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
					placeholder="Search by program name or code"
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>
				<Select
					placeholder="Status"
					data={ARCHIVE_STATUS_OPTIONS}
					onChange={(value) => handleChangeFilter('status', value || '')}
					clearable
				/>
			</Group>

			<Table.ScrollContainer minWidth={1100}>
				<Table bg="white" border={1}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>#</Table.Th>
						<Table.Th>Code</Table.Th>
						<Table.Th>Name</Table.Th>
						<Table.Th>Description</Table.Th>
						<Table.Th ta="center">Classes</Table.Th>
						<Table.Th ta="center">Students</Table.Th>
						<Table.Th ta="center">Status</Table.Th>
						<Table.Th ta="center">Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{isLoading ? loadingRows : hasData ? rows : emptyRows}</Table.Tbody>
				<Table.Tfoot>
					<Table.Tr>
						<Table.Td colSpan={8}>
							<Group justify="space-between">
								<Text>Total: {programs?.total || 0}</Text>
								{hasPagination && (
									<Pagination
										total={Math.ceil((programs?.total || 0) / 10)}
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
					Create Program
				</Button>
			</Group>
		</Paper>
	);
};
