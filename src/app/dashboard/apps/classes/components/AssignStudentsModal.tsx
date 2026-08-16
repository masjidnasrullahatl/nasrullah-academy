import { useMemo, useState } from 'react';

import {
	Alert,
	Badge,
	Button,
	Checkbox,
	Group,
	Input,
	ScrollArea,
	Stack,
	Text,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconAlertTriangle, IconSearch } from '@tabler/icons-react';

import { useAssignStudentsToClass } from '@hooks/react-query/classes/useAssignStudentsToClass';
import { useGetAvailableStudents } from '@hooks/react-query/classes/useGetAvailableStudents';

type AssignStudentsModalProps = {
	classItem: any;
};

export const AssignStudentsModal = ({ classItem }: AssignStudentsModalProps) => {
	const [keyword, setKeyword] = useState('');
	const [checkedIds, setCheckedIds] = useState<string[]>([]);

	const { mutateAsync: assignStudents, isPending, error } = useAssignStudentsToClass();

	const { data: students } = useGetAvailableStudents(classItem.id, {
		keyword,
	});

	const debouncedChangeKeyword = useDebouncedCallback((value: string) => {
		setKeyword(value);
	}, 500);

	const visibleIds = useMemo(() => students?.map((student) => student.id) || [], [students]);
	const allVisibleChecked =
		visibleIds.length > 0 && visibleIds.every((studentId) => checkedIds.includes(studentId));

	const handleToggleSelectAllVisible = () => {
		if (allVisibleChecked) {
			setCheckedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
			return;
		}

		setCheckedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
	};

	const handleToggleStudent = (studentId: string) => {
		setCheckedIds((prev) =>
			prev.includes(studentId)
				? prev.filter((item) => item !== studentId)
				: [...prev, studentId],
		);
	};

	const willExceedCapacity =
		Boolean(classItem.capacity) && classItem.studentCount + checkedIds.length > classItem.capacity;

	const handleSubmit = async () => {
		await assignStudents({
			classId: classItem.id,
			data: { studentIds: checkedIds },
		});

		notifications.show({
			title: 'Students assigned',
			message: `${checkedIds.length} student(s) assigned to class`,
			color: 'green',
		});

		modals.closeAll();
	};

	return (
		<Stack>
			<Input
				leftSection={<IconSearch size={16} />}
				placeholder="Search students by name or family"
				onChange={(event) => debouncedChangeKeyword(event.target.value)}
			/>

			<Checkbox
				label="Select all visible"
				checked={allVisibleChecked}
				onChange={handleToggleSelectAllVisible}
			/>

			{willExceedCapacity && (
				<Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
					Selection exceeds class capacity. You can still proceed.
				</Alert>
			)}

			{error && <Alert color="red">{error.message}</Alert>}

			<ScrollArea h={320}>
				<Stack gap="xs">
					{students?.length ? (
						students.map((student) => (
							<Checkbox
								key={student.id}
								checked={checkedIds.includes(student.id)}
								onChange={() => handleToggleStudent(student.id)}
								label={
									<Group gap="xs">
										<Text>{`${student.firstName} ${student.lastName}`}</Text>
										<Text c="dimmed" size="xs">
											{student.family?.name || '-'}
										</Text>
										<Badge variant="light" color={student.gender === 'BOY' ? 'blue' : 'pink'}>
											{student.gender}
										</Badge>
									</Group>
								}
							/>
						))
					) : (
						<Text c="dimmed" size="sm" ta="center" py="md">
							No available students found.
						</Text>
					)}
				</Stack>
			</ScrollArea>

			<Group justify="flex-end">
				<Button variant="default" onClick={() => modals.closeAll()}>
					Cancel
				</Button>
				<Button onClick={handleSubmit} loading={isPending} disabled={checkedIds.length === 0}>
					Assign students
				</Button>
			</Group>
		</Stack>
	);
};
