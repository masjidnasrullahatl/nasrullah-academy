import { useState } from 'react';

import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Input,
	Paper,
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
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
	ScholarshipRow,
	useDeleteScholarship,
	useGetPagingScholarships,
} from '@hooks/react-query/scholarships/useScholarships';

import { formatMoney } from '@utils/money';
import { getScholarshipProgress, ScholarshipStatus } from '@utils/scholarship';

import { ScholarshipFormModal } from './ScholarshipFormModal';

const STATUS_BADGES: Record<ScholarshipStatus, [string, string]> = {
	UPCOMING: ['blue', 'Upcoming'],
	ACTIVE: ['green', 'Active'],
	ENDING_SOON: ['orange', 'Ending soon'],
	ENDED: ['gray', 'Ended'],
};

const monthLabel = (value: string) =>
	dayjs(value.slice(0, 10)).format('MMMM YYYY');

const ScholarshipTableRow = ({
	scholarship,
}: {
	scholarship: ScholarshipRow;
}) => {
	const { mutateAsync: deleteScholarship } = useDeleteScholarship();

	const progress = getScholarshipProgress(scholarship);
	const [color, label] = STATUS_BADGES[progress.status];
	const studentName = `${scholarship.student.firstName} ${scholarship.student.lastName}`;

	const handleEdit = () =>
		modals.open({
			title: 'Edit Scholarship',
			size: 'lg',
			children: <ScholarshipFormModal scholarship={scholarship} />,
		});

	const handleDelete = () =>
		modals.openConfirmModal({
			title: 'Delete scholarship?',
			centered: true,
			children: `${studentName}: ${formatMoney(scholarship.amountReceived)}`,
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteScholarship({ id: scholarship.id });
				notifications.show({
					title: 'Scholarship deleted',
					message: 'Scholarship deleted successfully',
					color: 'green',
				});
			},
		});

	return (
		<Table.Tr>
			<Table.Td>
				<Text size="sm" fw={600}>
					{studentName}
				</Text>
				<Text size="xs" c="dimmed">
					{scholarship.student.family.name}
				</Text>
			</Table.Td>
			<Table.Td>{scholarship.donorName || 'Anonymous'}</Table.Td>
			<Table.Td ta="right">{formatMoney(scholarship.amountReceived)}</Table.Td>
			<Table.Td ta="right">{formatMoney(scholarship.monthlyAmount)}</Table.Td>
			<Table.Td ta="right">{formatMoney(progress.used)}</Table.Td>
			<Table.Td ta="right" fw={600}>
				{formatMoney(progress.remaining)}
			</Table.Td>
			<Table.Td>
				{monthLabel(scholarship.startMonth)} to {progress.coveredThrough || '-'}
			</Table.Td>
			<Table.Td>
				<Badge color={color} variant="light">
					{label}
				</Badge>
			</Table.Td>
			<Table.Td>
				<Group gap={4} wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon variant="default" onClick={handleEdit} aria-label="Edit">
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Delete">
						<ActionIcon
							variant="default"
							color="red"
							onClick={handleDelete}
							aria-label="Delete"
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};

export const ScholarshipsTable = () => {
	const [keyword, setKeyword] = useState('');
	const { data, isLoading, isError, error } = useGetPagingScholarships({
		page: 1,
		limit: 500,
		keyword,
	});

	const debounceKeyword = useDebouncedCallback(setKeyword, 500);

	const handleCreate = () =>
		modals.open({
			title: 'Add Scholarship',
			size: 'lg',
			children: <ScholarshipFormModal />,
		});

	return (
		<Paper p="md">
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Group mb="md">
				<Input
					flex={1}
					leftSection={<IconSearch size={16} />}
					placeholder="Search by student, family or who paid"
					onChange={(event) => debounceKeyword(event.target.value)}
				/>
				<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
					Add Scholarship
				</Button>
			</Group>

			<Table.ScrollContainer minWidth={1000}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="sm"
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Student</Table.Th>
							<Table.Th>Paid by</Table.Th>
							<Table.Th ta="right">Received</Table.Th>
							<Table.Th ta="right">Monthly</Table.Th>
							<Table.Th ta="right">Used</Table.Th>
							<Table.Th ta="right">Remaining</Table.Th>
							<Table.Th>Covers</Table.Th>
							<Table.Th>Status</Table.Th>
							<Table.Th w={1} />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{data?.data.map((scholarship) => (
							<ScholarshipTableRow
								key={scholarship.id}
								scholarship={scholarship}
							/>
						))}
						{!isLoading && !data?.data.length && (
							<Table.Tr>
								<Table.Td colSpan={9}>
									<Text size="sm" c="dimmed" ta="center">
										No scholarships yet
									</Text>
								</Table.Td>
							</Table.Tr>
						)}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
