import { ActionIcon, Badge, Group, Table, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';

import { ARCHIVE_STATUS_COLORS, ARCHIVE_STATUS_LABELS } from '@configs/enums';

import { useDeleteProgram } from '@hooks/react-query/programs/useDeleteProgram';
import { ProgramRow } from '@hooks/react-query/programs/useGetPagingPrograms';

import { ProgramFormModal } from '../ProgramFormModal';

type Props = {
	program: ProgramRow;
	page: number;
	index: number;
	pageSize: number;
};

export const TableRow = ({ program, page, index, pageSize }: Props) => {
	const { mutateAsync: deleteProgram, isPending: isDeleting } =
		useDeleteProgram();

	const handleEdit = () => {
		modals.open({
			title: 'Edit Program',
			size: 'lg',
			children: <ProgramFormModal program={program} />,
		});
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: `Delete program ${program.name}?`,
			children: 'This action cannot be undone.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteProgram({ id: program.id });
				notifications.show({
					title: 'Program deleted',
					message: 'Program deleted successfully',
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

			<Table.Td>{program.name}</Table.Td>

			<Table.Td maw={360}>
				<Text lineClamp={2}>
					{program.description || '-'}
				</Text>
			</Table.Td>

			<Table.Td ta="center">{program._count.classes}</Table.Td>

			<Table.Td ta="center">
				<Badge color={ARCHIVE_STATUS_COLORS[program.status]} variant="light">
					{ARCHIVE_STATUS_LABELS[program.status]}
				</Badge>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon color="yellow" onClick={handleEdit}>
							<IconEdit size={15} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Delete">
						<ActionIcon
							color="red"
							disabled={isDeleting}
							loading={isDeleting}
							onClick={handleDelete}
						>
							<IconTrash size={15} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
