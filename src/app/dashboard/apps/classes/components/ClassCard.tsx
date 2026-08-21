import {
	Avatar,
	Badge,
	Button,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useRemoveStudentFromClass } from '@hooks/react-query/classes/useRemoveStudentFromClass';
import { useUpdateClass } from '@hooks/react-query/classes/useUpdateClass';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { AssignStudentsModal } from './AssignStudentsModal';
import { ClassActionsMenu } from './ClassActionsMenu';
import { ClassStudentsTable } from './ClassStudentsTable';

type ClassCardProps = {
	classItem: any;
};

const getInitials = (name: string) =>
	name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase();

export const ClassCard = ({ classItem }: ClassCardProps) => {
	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });
	const { mutateAsync: updateClass, isPending: isUpdatingClass } = useUpdateClass();
	const { mutateAsync: removeStudent, isPending: isRemovingStudent } =
		useRemoveStudentFromClass();

	const handleChangeTeacher = async (teacherId: string | null) => {
		await updateClass({
			id: classItem.id,
			data: {
				name: classItem.name,
				programId: classItem.programId,
				teacherId,
				session: classItem.session,
				room: classItem.room,
				schoolYear: classItem.schoolYear,
				capacity: classItem.capacity,
				status: classItem.status,
			},
		});

		notifications.show({
			title: 'Teacher updated',
			message: 'Class teacher reassigned successfully',
			color: 'green',
		});
	};

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

	const teacherName = classItem.teacher
		? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
		: 'No teacher assigned';

	return (
		<Paper withBorder p="md">
			<Stack>
				<Group justify="space-between" align="flex-start">
					<Stack gap={2}>
						<Title order={4}>{classItem.name}</Title>
						<Group gap="xs">
							<Badge>{classItem.program.name}</Badge>
							<Badge color="blue" variant="light">
								{classItem.session}
							</Badge>
							{classItem.room && <Badge color="gray">{classItem.room}</Badge>}
						</Group>
					</Stack>
					<ClassActionsMenu classItem={classItem} />
				</Group>

				<Group align="flex-start" wrap="nowrap">
					<Avatar radius="xl" color="blue">
						{classItem.teacher ? getInitials(teacherName) : '?'}
					</Avatar>
					<Stack gap={2} style={{ flex: 1 }}>
						<Text fw={600}>{teacherName}</Text>
						<Text size="sm" c="dimmed">
							{classItem.teacher?.phoneNumber || 'No teacher phone'}
						</Text>
						<Select
							searchable
							clearable
							placeholder="Assign teacher"
							value={classItem.teacherId || null}
							data={teachers?.data.map((teacher) => ({
								value: teacher.id,
								label: `${teacher.firstName} ${teacher.lastName}`,
							}))}
							onChange={handleChangeTeacher}
							disabled={isUpdatingClass}
						/>
					</Stack>
				</Group>

				<Group>
					<Badge color="dark">Students {classItem.studentCount}/{classItem.capacity || '-'}</Badge>
					<Badge color="blue" variant="light">
						Boys {classItem.boysCount}
					</Badge>
					<Badge color="pink" variant="light">
						Girls {classItem.girlsCount}
					</Badge>
				</Group>

				<ClassStudentsTable
					classItem={classItem}
					onRemoveStudent={handleRemoveStudent}
					isRemovingStudent={isRemovingStudent}
				/>

				<Group justify="flex-end">
					<Button
						onClick={() =>
							modals.open({
								title: `Assign students to ${classItem.name}`,
								size: 'lg',
								children: <AssignStudentsModal classItem={classItem} />,
							})
						}
					>
						Assign students
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
};
