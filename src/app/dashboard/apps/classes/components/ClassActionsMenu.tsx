import { ActionIcon, Menu } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';

import { useDeleteClass } from '@hooks/react-query/classes/useDeleteClass';
import { useUpdateClass } from '@hooks/react-query/classes/useUpdateClass';

import { ClassFormModal } from './ClassFormModal';

type ClassActionsMenuProps = {
	classItem: any;
};

export const ClassActionsMenu = ({ classItem }: ClassActionsMenuProps) => {
	const { mutateAsync: deleteClass, isPending: isDeleting } = useDeleteClass();
	const { mutateAsync: updateClass, isPending: isUpdating } = useUpdateClass();

	const handleEdit = () => {
		modals.open({
			title: 'Edit Class',
			size: 'lg',
			children: <ClassFormModal classItem={classItem} />,
		});
	};

	const handleArchive = async () => {
		await updateClass({
			id: classItem.id,
			data: {
				name: classItem.name,
				programId: classItem.programId,
				teacherId: classItem.teacherId,
				session: classItem.session,
				room: classItem.room,
				schoolYear: classItem.schoolYear,
				capacity: classItem.capacity,
				status: classItem.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE',
			},
		});

		notifications.show({
			title: classItem.status === 'ACTIVE' ? 'Class archived' : 'Class activated',
			message:
				classItem.status === 'ACTIVE'
					? 'Class status changed to ARCHIVED'
					: 'Class status changed to ACTIVE',
			color: 'green',
		});
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: 'Delete class?',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteClass({ id: classItem.id });
				notifications.show({
					title: 'Class deleted',
					message: 'Class deleted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
		<Menu position="bottom-end">
			<Menu.Target>
				<ActionIcon variant="subtle">
					<IconDotsVertical size={16} />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>
					Edit
				</Menu.Item>
				<Menu.Item onClick={handleArchive} disabled={isUpdating}>
					{classItem.status === 'ACTIVE' ? 'Archive' : 'Activate'}
				</Menu.Item>
				<Menu.Item
					leftSection={<IconTrash size={14} />}
					color="red"
					onClick={handleDelete}
					disabled={isDeleting}
				>
					Delete
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
