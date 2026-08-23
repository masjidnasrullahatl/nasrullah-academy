import { useMemo } from 'react';

import { Badge, Button, Group, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';
import { useRemoveStudentFromClass } from '@hooks/react-query/classes/useRemoveStudentFromClass';

import { AssignStudentsModal } from './AssignStudentsModal';
import { ClassStudentsTable } from './ClassStudentsTable';

type ClassStudentsModalProps = {
	classId: string;
};

export const ClassStudentsModal = ({ classId }: ClassStudentsModalProps) => {
	const { data: classes } = useGetPagingClasses({
		page: 1,
		limit: 500,
	});
	const { mutateAsync: removeStudent, isPending: isRemovingStudent } =
		useRemoveStudentFromClass();

	const classItem = useMemo(
		() => classes?.data.find((item) => item.id === classId),
		[classId, classes?.data],
	);

	if (!classItem) {
		return null;
	}

	const handleRemoveStudent = async (studentId: string) => {
		await removeStudent({
			classId: classItem.id,
			studentId,
		});

		notifications.show({
			title: 'Student removed',
			message: 'Student moved to withdrawn status in this class',
			color: 'green',
		});
	};

	const openAssignStudents = () => {
		modals.open({
			title: `Assign students to ${classItem.name}`,
			size: 'lg',
			children: <AssignStudentsModal classItem={classItem} />,
		});
	};

	return (
		<Stack>
			<Group justify="space-between" wrap="wrap">
				<Group>
					<Badge variant="light">Students {classItem.studentCount}</Badge>
					<Badge color="blue" variant="light">
						Boys {classItem.boysCount}
					</Badge>
					<Badge color="pink" variant="light">
						Girls {classItem.girlsCount}
					</Badge>
				</Group>
				<Button onClick={openAssignStudents}>Assign students</Button>
			</Group>

			<ClassStudentsTable
				classItem={classItem}
				onRemoveStudent={handleRemoveStudent}
				isRemovingStudent={isRemovingStudent}
			/>
		</Stack>
	);
};
