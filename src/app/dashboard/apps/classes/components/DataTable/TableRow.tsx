import { ActionIcon, Badge, Group, Table, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconChalkboard, IconUsers } from '@tabler/icons-react';

import { ClassRow } from '@hooks/react-query/classes/useGetPagingClasses';

import { AssignTeacherModal } from '../AssignTeacherModal';
import { ClassStudentsModal } from '../ClassStudentsModal';

import { ClassActionsMenu } from './ClassActionsMenu';

type Props = {
	classItem: ClassRow;
	page: number;
	index: number;
	pageSize: number;
};

export const TableRow = ({ classItem, page, index, pageSize }: Props) => {
	const openAssignTeacher = (item: ClassRow) => {
		modals.open({
			title: `Assign teacher to ${item.name}`,
			size: 'md',
			children: <AssignTeacherModal classId={item.id} />,
		});
	};

	const openStudents = (item: ClassRow) => {
		modals.open({
			title: `Students — ${item.name}`,
			size: 'xl',
			children: <ClassStudentsModal classId={item.id} />,
		});
	};

	return (
		<Table.Tr key={classItem.id}>
			<Table.Td ta="center" w={50} className={stickyStyles.stickyLeft}>
				{(page - 1) * pageSize + index + 1}
			</Table.Td>

			<Table.Td>{classItem.name}</Table.Td>

			<Table.Td>{classItem.program.name}</Table.Td>

			<Table.Td>
				{classItem.teacher
					? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
					: '-'}
			</Table.Td>

			<Table.Td w={100} ta="center" c="green" fw={700}>
				{classItem.studentCount}
			</Table.Td>

			<Table.Td w={100} ta="center" c="blue" fw={700}>
				{classItem.boysCount}
			</Table.Td>

			<Table.Td w={100} ta="center" c="red" fw={700}>
				{classItem.girlsCount}
			</Table.Td>

			<Table.Td w={120} ta="center">
				<Badge color={classItem.status === 'ACTIVE' ? 'green' : 'gray'}>
					{classItem.status}
				</Badge>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight}>
				<Group gap="xs" justify="center" wrap="nowrap">
					<Tooltip label="Assign teacher">
						<ActionIcon onClick={() => openAssignTeacher(classItem)}>
							<IconChalkboard size={16} />
						</ActionIcon>
					</Tooltip>

					<Tooltip label="View students">
						<ActionIcon color="teal" onClick={() => openStudents(classItem)}>
							<IconUsers size={16} />
						</ActionIcon>
					</Tooltip>

					<ClassActionsMenu classItem={classItem} />
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
