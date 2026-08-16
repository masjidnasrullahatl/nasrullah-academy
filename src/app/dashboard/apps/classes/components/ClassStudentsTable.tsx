import {
	ActionIcon,
	Badge,
	Group,
	Table,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconTrash } from '@tabler/icons-react';

type ClassStudentsTableProps = {
	classItem: any;
	onRemoveStudent: any;
	isRemovingStudent?: boolean;
};

export const ClassStudentsTable = ({
	classItem,
	onRemoveStudent,
	isRemovingStudent,
}: ClassStudentsTableProps) => {
	return (
		<Table.ScrollContainer minWidth={500} maxHeight={280}>
			<Table bg="white" border={1}>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>#</Table.Th>
						<Table.Th>Student</Table.Th>
						<Table.Th>Family</Table.Th>
						<Table.Th>Gender</Table.Th>
						<Table.Th ta="center">Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{classItem.enrollments.length === 0 ? (
						<Table.Tr>
							<Table.Td colSpan={5}>
								<Text c="dimmed" size="sm" ta="center">
									No students assigned yet.
								</Text>
							</Table.Td>
						</Table.Tr>
					) : (
						classItem.enrollments.map((enrollment: any, index: number) => (
							<Table.Tr key={enrollment.id}>
								<Table.Td>{index + 1}</Table.Td>
								<Table.Td>{`${enrollment.student.firstName} ${enrollment.student.lastName}`}</Table.Td>
								<Table.Td>{enrollment.student.family?.name || '-'}</Table.Td>
								<Table.Td>
									<Badge
										color={enrollment.student.gender === 'BOY' ? 'blue' : 'pink'}
										variant="light"
									>
										{enrollment.student.gender}
									</Badge>
								</Table.Td>
								<Table.Td ta="center">
									<Group justify="center" gap="xs">
										<Tooltip label="Remove student">
											<ActionIcon
												color="red"
												disabled={isRemovingStudent}
												onClick={() => {
													modals.openConfirmModal({
														title: 'Remove student from class?',
														labels: { confirm: 'Remove', cancel: 'Cancel' },
														confirmProps: { color: 'red' },
														onConfirm: () => onRemoveStudent(enrollment.student.id),
													});
												}}
											>
												<IconTrash size={14} />
											</ActionIcon>
										</Tooltip>
									</Group>
								</Table.Td>
							</Table.Tr>
						))
					)}
				</Table.Tbody>
			</Table>
		</Table.ScrollContainer>
	);
};
