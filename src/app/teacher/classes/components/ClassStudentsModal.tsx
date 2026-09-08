import { Box, Table } from '@mantine/core';

import dayjs from 'dayjs';

import { GENDER_LABELS } from '@configs/enums';

import { MyClassRow } from '@hooks/react-query/teacher/useGetMyClasses';

type Props = {
	classItem: MyClassRow;
};

export const ClassStudentsModal = ({ classItem }: Props) => {
	return (
		<Table withTableBorder withColumnBorders>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>#</Table.Th>
					<Table.Th>Student Name</Table.Th>
					<Table.Th>Gender</Table.Th>
					<Table.Th>Enrolled Date</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{classItem.enrollments.length ? (
					classItem.enrollments.map((enrollment, index) => (
						<Table.Tr key={enrollment.id}>
							<Table.Td>{index + 1}</Table.Td>
							<Table.Td>{`${enrollment.student.firstName} ${enrollment.student.lastName}`}</Table.Td>
							<Table.Td>{GENDER_LABELS[enrollment.student.gender]}</Table.Td>
							<Table.Td>
								{dayjs(
									enrollment.student.enrolledAt || enrollment.startDate,
								).format('MM/DD/YYYY')}
							</Table.Td>
						</Table.Tr>
					))
				) : (
					<Table.Tr>
						<Table.Td colSpan={4}>
							<Box py="md" ta="center" c="dimmed">
								No active students
							</Box>
						</Table.Td>
					</Table.Tr>
				)}
			</Table.Tbody>
		</Table>
	);
};
