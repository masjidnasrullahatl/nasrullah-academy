import { ActionIcon, Badge, Group, Table, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { Classes, Teachers } from '@prisma/client';
import stickyStyles from '@styles/sticky-table.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';

import { useDeleteTeacher } from '@hooks/react-query/teachers/useDeleteTeacher';

import { TeacherFormModal } from '../TeacherFormModal';

type Props = {
	teacher: Teachers & {
		classes: Classes[];
	};
	page: number;
	index: number;
};

export const TableRow = ({ teacher, page, index }: Props) => {
	const { mutateAsync: deleteTeacher, isPending: isDeleting } =
		useDeleteTeacher();

	const handleEdit = (teacher: Teachers) => {
		modals.open({
			size: 'lg',
			title: 'Edit Teacher',
			children: <TeacherFormModal teacher={teacher} />,
		});
	};

	const handleDelete = (teacher: Teachers) => {
		modals.openConfirmModal({
			title: `Delete teacher ${teacher.firstName} ${teacher.lastName}?`,
			children:
				'This removes the teacher profile and unassigns related classes.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteTeacher({ id: teacher.id });

					notifications.show({
						title: 'Teacher deleted',
						message: 'Teacher deleted successfully',
						color: 'green',
					});
				} catch (error: any) {
					notifications.show({
						color: 'red',
						title: 'Failed to delete teacher',
						message: error.message,
					});
				}
			},
		});
	};

	return (
		<Table.Tr key={teacher.id}>
			<Table.Td ta="center" className={stickyStyles.stickyLeft}>
				{(page - 1) * 10 + index + 1}
			</Table.Td>

			<Table.Td>{`${teacher.firstName} ${teacher.lastName}`}</Table.Td>

			<Table.Td>{teacher.phoneNumber || '-'}</Table.Td>

			<Table.Td>{teacher.email || '-'}</Table.Td>

			<Table.Td>
				<Group gap={4}>
					{teacher.classes.map((classItem) => (
						<Badge key={classItem.id} variant="light">
							{classItem.name}
						</Badge>
					))}
				</Group>
			</Table.Td>

			<Table.Td w={120} ta="center">
				<Badge color={teacher.status === 'ACTIVE' ? 'green' : 'gray'}>
					{teacher.status}
				</Badge>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon onClick={() => handleEdit(teacher)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Delete">
						<ActionIcon
							disabled={isDeleting}
							loading={isDeleting}
							color="red"
							onClick={() => handleDelete(teacher)}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
