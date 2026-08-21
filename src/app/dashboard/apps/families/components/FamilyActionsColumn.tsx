import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconEdit, IconTrash } from '@tabler/icons-react';

import { useDeleteFamily } from '@hooks/react-query/families/useDeleteFamily';

import { FamilyForm } from './FamilyForm';

type FamilyActionsColumnProps = {
	family: any;
};

export const FamilyActionsColumn = ({ family }: FamilyActionsColumnProps) => {
	const { mutateAsync: deleteFamily, isPending } = useDeleteFamily();

	const handleEdit = () => {
		modals.open({
			title: 'Edit Family',
			size: 'xl',
			children: <FamilyForm family={family} />,
		});
	};

	const handleDelete = () => {
		modals.openConfirmModal({
			title: `Delete family ${family.name}?`,
			centered: true,
			children:
				'Deleting this family will also remove all students and payment records for the family.',
			labels: { confirm: 'Delete family', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteFamily({ id: family.id });
				notifications.show({
					title: 'Family deleted',
					message: 'Family deleted successfully',
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
