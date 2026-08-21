import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconEdit, IconTrash } from '@tabler/icons-react';

import { useDeleteStudent } from '@hooks/react-query/students/useDeleteStudent';

import { StudentForm } from './StudentForm';

type StudentActionsColumnProps = {
	student: any;
};

export const StudentActionsColumn = ({ student }: StudentActionsColumnProps) => {
	const { mutateAsync: deleteStudent, isPending } = useDeleteStudent();

	const handleEdit = () => {
		modals.open({
			title: 'Edit Student',
			children: <StudentForm student={student} />,
			size: 'lg',
		});
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: `Delete ${student.firstName} ${student.lastName}?`,
			children: 'This permanently deletes this student and related enrollments.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteStudent({ id: student.id });
				notifications.show({
					title: 'Student deleted',
					message: 'Student deleted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
		<Group gap="xs" justify="center">
			<Tooltip label="Edit">
				<ActionIcon onClick={handleEdit} disabled={isPending}>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label="Delete">
				<ActionIcon color="red" onClick={handleDelete} disabled={isPending}>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
};
