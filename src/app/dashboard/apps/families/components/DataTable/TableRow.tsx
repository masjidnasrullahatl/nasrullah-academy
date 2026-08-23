import Link from 'next/link';

import {
	ActionIcon,
	Anchor,
	Badge,
	Group,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';

import { PATH_APPS } from '@configs/routes';

import { useDeleteFamily } from '@hooks/react-query/families/useDeleteFamily';

import { FamilyFormModal } from '../FamilyFormModal';

type Props = {
	family: any;
	page: number;
	index: number;
};

export const TableRow = ({ family, page, index }: Props) => {
	const { mutateAsync: deleteFamily, isPending: isDeleting } =
		useDeleteFamily();

	const handleEdit = (item: any) => {
		modals.open({
			title: 'Edit Family',
			size: 'xl',
			children: <FamilyFormModal family={item} />,
		});
	};

	const handleDelete = (item: any) => {
		modals.openConfirmModal({
			title: `Delete family ${item.name}?`,
			centered: true,
			children:
				'Deleting this family will also remove all students and payment records for the family.',
			labels: { confirm: 'Delete family', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteFamily({ id: item.id });
				notifications.show({
					title: 'Family deleted',
					message: 'Family deleted successfully',
					color: 'green',
				});
			},
		});
	};

	return (
		<Table.Tr key={family.id}>
			<Table.Td ta="center" w={50} className={stickyStyles.stickyLeft}>
				{(page - 1) * 10 + index + 1}
			</Table.Td>

			<Table.Td>
				<Anchor component={Link} href={`${PATH_APPS.families}/${family.id}`}>
					{family.name}
				</Anchor>
			</Table.Td>

			<Table.Td>
				<Stack gap={0}>
					<Text size="sm">{family.primaryPhone}</Text>
					{family.secondaryPhone && (
						<Text size="xs" c="dimmed">
							{family.secondaryPhone}
						</Text>
					)}
				</Stack>
			</Table.Td>

			<Table.Td w={100} ta="center" c="green" fw={700}>
				{family.studentCount}
			</Table.Td>

			<Table.Td w={100} ta="center" c="blue" fw={700}>
				{family.boysCount}
			</Table.Td>

			<Table.Td w={100} ta="center" c="red" fw={700}>
				{family.girlsCount}
			</Table.Td>

			<Table.Td w={120} ta="center">
				<Badge color={family.status === 'ACTIVE' ? 'green' : 'gray'}>
					{family.status}
				</Badge>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon onClick={() => handleEdit(family)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="Delete">
						<ActionIcon
							disabled={isDeleting}
							loading={isDeleting}
							color="red"
							onClick={() => handleDelete(family)}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
