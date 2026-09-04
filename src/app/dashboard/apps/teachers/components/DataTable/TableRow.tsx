import {
	ActionIcon,
	Badge,
	Group,
	Menu,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import stickyStyles from '@styles/sticky-table.module.css';
import {
	IconDotsVertical,
	IconEdit,
	IconMailForward,
	IconMailPlus,
	IconPlayerPause,
	IconPlayerPlay,
	IconTrash,
} from '@tabler/icons-react';

import { useActivateTeacher } from '@hooks/react-query/teachers/useActivateTeacher';
import { useDeactivateTeacher } from '@hooks/react-query/teachers/useDeactivateTeacher';
import { useDeleteTeacher } from '@hooks/react-query/teachers/useDeleteTeacher';
import { TeacherRow } from '@hooks/react-query/teachers/useGetPagingTeachers';
import { useInviteTeacher } from '@hooks/react-query/teachers/useInviteTeacher';
import { useResendInvite } from '@hooks/react-query/teachers/useResendInvite';

import { formatMoney } from '@utils/money';

import { TeacherFormModal } from '../TeacherFormModal';

type Props = {
	teacher: TeacherRow;
	page: number;
	index: number;
};

export const TableRow = ({ teacher, page, index }: Props) => {
	const { mutateAsync: deleteTeacher, isPending: isDeleting } =
		useDeleteTeacher();
	const { mutateAsync: inviteTeacher, isPending: isInviting } =
		useInviteTeacher();
	const { mutateAsync: resendInvite, isPending: isResending } =
		useResendInvite();
	const { mutateAsync: deactivateTeacher, isPending: isDeactivating } =
		useDeactivateTeacher();
	const { mutateAsync: activateTeacher, isPending: isActivating } =
		useActivateTeacher();

	const handleEdit = (item: TeacherRow) => {
		modals.open({
			size: 'lg',
			title: 'Edit Teacher',
			children: <TeacherFormModal teacher={item} />,
		});
	};

	const handleDelete = (item: TeacherRow) => {
		modals.openConfirmModal({
			title: `Delete teacher ${item.firstName} ${item.lastName}?`,
			children:
				'This removes the teacher profile and unassigns related classes.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deleteTeacher({ id: item.id });

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

	const handleInvite = (item: TeacherRow) => {
		modals.openConfirmModal({
			title: 'Create teacher account?',
			children: `This will send an invite email to ${item.email}. Continue?`,
			labels: { confirm: 'Send Invite', cancel: 'Cancel' },
			onConfirm: async () => {
				await inviteTeacher({ id: item.id });
			},
		});
	};

	const handleDeactivate = (item: TeacherRow) => {
		modals.openConfirmModal({
			title: `Deactivate account for ${item.firstName} ${item.lastName}?`,
			children: 'Teacher will not be able to access the portal.',
			labels: { confirm: 'Deactivate', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deactivateTeacher({ id: item.id });
			},
		});
	};

	const hasAccount = Boolean(teacher.supabaseUserId);
	const canCreateAccount = !hasAccount && Boolean(teacher.email);
	const canResendInvite = hasAccount && teacher.status === 'ACTIVE';
	const canDeactivate = hasAccount && teacher.status === 'ACTIVE';
	const canActivate = hasAccount && teacher.status === 'INACTIVE';

	return (
		<Table.Tr key={teacher.id}>
			<Table.Td ta="center" className={stickyStyles.stickyLeft}>
				{(page - 1) * 10 + index + 1}
			</Table.Td>

			<Table.Td>{`${teacher.firstName} ${teacher.lastName}`}</Table.Td>

			<Table.Td>{teacher.phoneNumber || '-'}</Table.Td>

			<Table.Td>{teacher.email || '-'}</Table.Td>

			<Table.Td ta="right">
				{teacher.hourlyRate === null ? '—' : formatMoney(teacher.hourlyRate)}
			</Table.Td>

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

			<Table.Td ta="center">
				{!hasAccount ? (
					<Text c="dimmed">—</Text>
				) : teacher.status === 'ACTIVE' ? (
					<Badge color="green">Active</Badge>
				) : (
					<Badge color="red">Deactivated</Badge>
				)}
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Edit">
						<ActionIcon onClick={() => handleEdit(teacher)}>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>

					<Menu position="bottom-end">
						<Menu.Target>
							<ActionIcon variant="subtle">
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							{canCreateAccount && (
								<Menu.Item
									leftSection={<IconMailPlus size={14} />}
									onClick={() => handleInvite(teacher)}
									disabled={isInviting}
								>
									Create Account
								</Menu.Item>
							)}

							{canResendInvite && (
								<Menu.Item
									leftSection={<IconMailForward size={14} />}
									onClick={() => resendInvite({ id: teacher.id })}
									disabled={isResending}
								>
									Resend Invite
								</Menu.Item>
							)}

							{canDeactivate && (
								<Menu.Item
									leftSection={<IconPlayerPause size={14} />}
									color="red"
									onClick={() => handleDeactivate(teacher)}
									disabled={isDeactivating}
								>
									Deactivate Account
								</Menu.Item>
							)}

							{canActivate && (
								<Menu.Item
									leftSection={<IconPlayerPlay size={14} />}
									onClick={() => activateTeacher({ id: teacher.id })}
									disabled={isActivating}
								>
									Activate Account
								</Menu.Item>
							)}

							<Menu.Divider />
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								color="red"
								onClick={() => handleDelete(teacher)}
								disabled={isDeleting}
							>
								Delete
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
