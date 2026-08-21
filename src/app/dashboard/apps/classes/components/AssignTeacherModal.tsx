import { useEffect, useMemo, useState } from 'react';

import { Avatar, Button, Group, Select, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { ModalFooter } from '@components/ModalFooter';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';
import { useUpdateClass } from '@hooks/react-query/classes/useUpdateClass';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

type AssignTeacherModalProps = {
	classId: string;
};

const getInitials = (name: string) =>
	name
		.split(' ')
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.toUpperCase();

export const AssignTeacherModal = ({ classId }: AssignTeacherModalProps) => {
	const [teacherId, setTeacherId] = useState<string | null>(null);

	const { data: classes } = useGetPagingClasses({
		page: 1,
		limit: 500,
	});
	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });
	const { mutateAsync: updateClass, isPending } = useUpdateClass();

	const classItem = useMemo(
		() => classes?.data.find((item) => item.id === classId),
		[classId, classes?.data],
	);

	useEffect(() => {
		setTeacherId(classItem?.teacherId || null);
	}, [classItem?.teacherId]);

	const teacherName = classItem?.teacher
		? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
		: 'No teacher assigned';

	const handleSave = async () => {
		if (!classItem) {
			return;
		}

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
			title: teacherId ? 'Teacher assigned' : 'Teacher removed',
			message: teacherId
				? 'Class teacher updated successfully'
				: 'Teacher removed from class',
			color: 'green',
		});

		modals.closeAll();
	};

	return (
		<Stack>
			<Group align="flex-start" wrap="nowrap">
				<Avatar radius="xl" color="blue">
					{classItem?.teacher ? getInitials(teacherName) : '?'}
				</Avatar>
				<Stack gap={2} style={{ flex: 1 }}>
					<Text fw={600}>{teacherName}</Text>
					<Text size="sm" c="dimmed">
						{classItem?.teacher?.phoneNumber || 'No teacher phone'}
					</Text>
				</Stack>
			</Group>

			<Select
				label="Teacher"
				searchable
				clearable
				placeholder="Select a teacher"
				value={teacherId}
				data={teachers?.data.map((teacher) => ({
					value: teacher.id,
					label: `${teacher.firstName} ${teacher.lastName}`,
				}))}
				onChange={setTeacherId}
			/>

			<ModalFooter>
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button onClick={handleSave} loading={isPending}>
					Save
				</Button>
			</ModalFooter>
		</Stack>
	);
};
