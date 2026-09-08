import { useMemo } from 'react';

import { Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
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
	const { data: classes, isLoading } = useGetPagingClasses({
		page: 1,
		limit: 500,
	});

	const { mutateAsync: removeStudent, isPending: isRemovingStudent } =
		useRemoveStudentFromClass();

	const classItem = useMemo(
		() => classes?.data.find((item) => item.id === classId),
		[classId, classes?.data],
	);

	const handleRemoveStudent = async (studentId: string) => {
		if (!classItem) return;

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
		if (!classItem) return;

		modals.open({
			title: `Assign students to ${classItem.name}`,
			size: 'md',
			children: <AssignStudentsModal classItem={classItem} />,
		});
	};

	if (isLoading) {
		return (
			<Center mih={200}>
				<Stack gap="md" justify="center" align="center">
					<Loader size={24} />
					<Text>Loading...</Text>
				</Stack>
			</Center>
		);
	}

	if (!classItem) return;

	return (
		<Stack>
			<Group justify="space-between" wrap="wrap">
				<Group>
					<Text fz="sm">
						Students:{' '}
						<Text span c="green" fz="sm" fw={600}>
							{classItem.studentCount}
						</Text>
					</Text>

					<Text fz="sm">
						Boys:{' '}
						<Text span c="blue" fz="sm" fw={600}>
							{classItem.boysCount}
						</Text>
					</Text>

					<Text fz="sm">
						Girls:{' '}
						<Text span c="pink" fz="sm" fw={600}>
							{classItem.girlsCount}
						</Text>
					</Text>
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
