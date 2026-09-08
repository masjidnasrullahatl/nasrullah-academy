import { Table } from '@mantine/core';
import { modals } from '@mantine/modals';

import { MyClassRow } from '@hooks/react-query/teacher/useGetMyClasses';

import { ClassStudentsModal } from '../ClassStudentsModal';

type Props = {
	classItem: MyClassRow;
	index: number;
};

export const TableRow = ({ classItem, index }: Props) => {
	const openStudents = (item: MyClassRow) => {
		modals.open({
			title: `Students — ${item.name}`,
			size: 'lg',
			children: <ClassStudentsModal classItem={item} />,
		});
	};

	return (
		<Table.Tr
			style={{ cursor: 'pointer' }}
			onClick={() => openStudents(classItem)}
		>
			<Table.Td>{index + 1}</Table.Td>

			<Table.Td>{classItem.name}</Table.Td>

			<Table.Td>{classItem.program.name}</Table.Td>

			<Table.Td ta="center">{classItem._count.enrollments}</Table.Td>
		</Table.Tr>
	);
};
