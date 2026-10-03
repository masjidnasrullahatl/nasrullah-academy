import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconBook, IconEdit, IconTrash, IconTrophy } from '@tabler/icons-react';

import { useDeleteMilestone } from '@hooks/react-query/milestones/useDeleteMilestone';
import { MilestoneRow } from '@hooks/react-query/milestones/useGetPagingMilestones';

import { formatCompletedAt, getMilestoneLabel } from '../../utils';
import { MilestoneFormModal } from '../MilestoneFormModal';

type Props = {
	milestone: MilestoneRow;
	page: number;
	index: number;
	pageSize: number;
};

export const TableRow = ({ milestone, page, index, pageSize }: Props) => {
	const { mutateAsync: deleteMilestone, isPending: isDeleting } =
		useDeleteMilestone();

	const studentName = [
		milestone.student.firstName,
		milestone.student.lastName,
	].join(' ');

	const handleEdit = () => {
		modals.open({
			title: 'Edit Milestone',
			size: 'lg',
			children: <MilestoneFormModal milestone={milestone} />,
		});
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: 'Delete milestone?',
			centered: true,
			children: studentName + ': ' + getMilestoneLabel(milestone),
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteMilestone({ id: milestone.id });
				notifications.show({
					title: 'Milestone deleted',
					message: 'Milestone deleted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
		<Table.Tr>
			<Table.Td ta="center" className={stickyStyles.stickyLeft}>
				{(page - 1) * pageSize + index + 1}
			</Table.Td>

			<Table.Td w={120}>{formatCompletedAt(milestone.completedAt)}</Table.Td>

			<Table.Td>{studentName}</Table.Td>

			<Table.Td>{milestone.student.family.name}</Table.Td>

			<Table.Td>
				<Group gap={4}>
					{milestone.student.programs.map((program) => (
						<Badge key={program.id} variant="light">
							{program.name}
						</Badge>
					))}
				</Group>
			</Table.Td>

			<Table.Td>
				<Group gap={6} wrap="nowrap">
					{milestone.type === 'JUZ' ? (
						<IconTrophy size={16} color="var(--mantine-color-yellow-7)" />
					) : (
						<IconBook size={16} color="var(--mantine-color-blue-6)" />
					)}
					<Text size="sm">{getMilestoneLabel(milestone)}</Text>
				</Group>
			</Table.Td>

			<Table.Td>
				<Text size="sm" c={milestone.notes ? undefined : 'dimmed'}>
					{milestone.notes || '—'}
				</Text>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon onClick={handleEdit}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Delete">
						<ActionIcon
							color="red"
							disabled={isDeleting}
							loading={isDeleting}
							onClick={handleDelete}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
