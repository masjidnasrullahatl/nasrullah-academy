import { ActionIcon, Badge, Group, Table, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { useDeleteStudent } from '@hooks/react-query/students/useDeleteStudent';

import { StudentFormModal } from '../StudentFormModal';

type Props = {
	student: any;
	page: number;
	index: number;
};

export const TableRow = ({ student, page, index }: Props) => {
	const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudent();

	const handleEdit = (item: any) => {
		modals.open({
			title: 'Edit Student',
			children: <StudentFormModal student={item} />,
			size: 'lg',
		});
	};

	const handleDelete = (item: any) => {
		modals.openConfirmModal({
			title: `Delete ${item.firstName} ${item.lastName}?`,
			children: 'This permanently deletes this student and related enrollments.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteStudent({ id: item.id });
				notifications.show({
					title: 'Student deleted',
					message: 'Student deleted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
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
					{student.enrollments.map((enrollment: any) => (
						<Badge key={enrollment.id} variant="light">
							{enrollment.class.name}
						</Badge>
					))}
				</Group>
			</Table.Td>
			<Table.Td ta="center">
				<Badge color={student.status === 'ACTIVE' ? 'green' : 'gray'}>{student.status}</Badge>
			</Table.Td>
			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon onClick={() => handleEdit(student)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Delete">
						<ActionIcon
							disabled={isDeleting}
							loading={isDeleting}
							color="red"
							onClick={() => handleDelete(student)}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
