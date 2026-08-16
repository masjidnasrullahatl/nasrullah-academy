'use client';

import { useParams } from 'next/navigation';

import { useMemo, useState } from 'react';

import {
	ActionIcon,
	Anchor,
	Avatar,
	Badge,
	Button,
	Container,
	Grid,
	Group,
	Input,
	Pagination,
	Paper,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { IconEdit, IconSearch, IconTrash } from '@tabler/icons-react';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { useGetClassDetail } from '@hooks/react-query/classes/useGetClassDetail';
import { useRemoveStudentFromClass } from '@hooks/react-query/classes/useRemoveStudentFromClass';

import { AssignStudentsModal } from '../components/AssignStudentsModal';
import { ClassFormModal } from '../components/ClassFormModal';

const getInitials = (name: string) =>
	name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase();

export default function ClassDetailPage() {
	const params = useParams<{ id: string }>();
	const classId = params.id;
	const [page, setPage] = useState(1);
	const [keyword, setKeyword] = useState('');
	const perPage = 10;

	const { data: classItem } = useGetClassDetail(classId);
	const { mutateAsync: removeStudent, isPending: isRemovingStudent } =
		useRemoveStudentFromClass();

	const teacherName = classItem?.teacher
		? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
		: 'No teacher assigned';

	const debouncedChangeKeyword = useDebouncedCallback((value: string) => {
		setKeyword(value);
		setPage(1);
	}, 500);

	const filteredEnrollments = useMemo(() => {
		const enrollments = classItem?.enrollments || [];
		const keywordLower = keyword.toLowerCase().trim();

		if (!keywordLower) {
			return enrollments;
		}

		return enrollments.filter((enrollment: any) => {
			const studentName =
				`${enrollment.student.firstName} ${enrollment.student.lastName}`.toLowerCase();
			const familyName = (enrollment.student.family?.name || '').toLowerCase();

			return studentName.includes(keywordLower) || familyName.includes(keywordLower);
		});
	}, [classItem?.enrollments, keyword]);

	const pageEnrollments = useMemo(() => {
		const start = (page - 1) * perPage;
		return filteredEnrollments.slice(start, start + perPage);
	}, [filteredEnrollments, page]);

	const stats = useMemo(() => {
		const activeStudents = classItem?.enrollments?.map((enrollment: any) => enrollment.student) || [];
		const total = activeStudents.length;
		const boys = activeStudents.filter((student: any) => student.gender === 'BOY').length;
		const girls = activeStudents.filter((student: any) => student.gender === 'GIRL').length;
		const capacity = classItem?.capacity || 0;
		const capacityUsed = capacity ? `${total}/${capacity}` : `${total}/-`;

		return {
			boys,
			capacityUsed,
			girls,
			total,
		};
	}, [classItem?.capacity, classItem?.enrollments]);

	const items = useMemo(
		() =>
			[
				{ title: 'Dashboard', href: PATH_DASHBOARD.default },
				{ title: 'Apps', href: PATH_APPS.root },
				{ title: 'Classes', href: PATH_APPS.classes },
				{
					title: classItem?.name || 'Class detail',
					href: `${PATH_APPS.classes}/${classId}`,
				},
			].map((item, index) => (
				<Anchor href={item.href} key={index}>
					{item.title}
				</Anchor>
			)),
		[classId, classItem?.name],
	);

	const handleEditClass = () => {
		if (!classItem) {
			return;
		}

		modals.open({
			title: 'Edit Class',
			size: 'lg',
			children: <ClassFormModal classItem={classItem} />,
		});
	};

	const handleAssignStudents = () => {
		if (!classItem) {
			return;
		}

		modals.open({
			title: `Assign students to ${classItem.name}`,
			size: 'lg',
			children: <AssignStudentsModal classItem={classItem} />,
		});
	};

	const handleRemoveStudent = (studentId: string) => {
		if (!classItem) {
			return;
		}

		modals.openConfirmModal({
			title: 'Remove student from class?',
			labels: { confirm: 'Remove', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await removeStudent({
					classId: classItem.id,
					studentId,
				});

				notifications.show({
					title: 'Student removed',
					message: 'Student moved to withdrawn status in this class',
					color: 'green',
				});
			},
		});
	};

	return (
		<>
			<title>Class Detail | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader
						title={classItem?.name || 'Class Detail'}
						breadcrumbItems={items}
						actionButton={
							<Button leftSection={<IconEdit size={16} />} onClick={handleEditClass}>
								Edit class
							</Button>
						}
					/>

					<Paper p="md" withBorder>
						<Group justify="space-between" align="flex-start">
							<Stack gap={4}>
								<Title order={4}>{classItem?.name || 'Class'}</Title>
								<Group gap="xs">
									<Badge>{classItem?.program?.name || '-'}</Badge>
									<Badge color="blue" variant="light">
										{classItem?.session || 'NA'}
									</Badge>
									{classItem?.room && <Badge color="gray">{classItem.room}</Badge>}
									<Badge color={classItem?.status === 'ACTIVE' ? 'green' : 'gray'}>
										{classItem?.status || 'ACTIVE'}
									</Badge>
								</Group>
							</Stack>
							<Button onClick={handleAssignStudents}>Assign students</Button>
						</Group>
					</Paper>

					<Grid>
						<Grid.Col span={{ base: 12, md: 5 }}>
							<Paper p="md" withBorder h="100%">
								<Group align="flex-start" wrap="nowrap">
									<Avatar radius="xl" color="blue" size="lg">
										{classItem?.teacher ? getInitials(teacherName) : '?'}
									</Avatar>
									<Stack gap={2}>
										<Text fw={600}>{teacherName}</Text>
										<Text size="sm" c="dimmed">
											{classItem?.teacher?.phoneNumber || 'No teacher phone'}
										</Text>
										<Text size="sm" c="dimmed">
											{classItem?.teacher?.email || 'No teacher email'}
										</Text>
									</Stack>
								</Group>
							</Paper>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 7 }}>
							<Grid>
								<Grid.Col span={{ base: 6, sm: 3 }}>
									<Paper p="md" withBorder>
										<Text size="sm" c="dimmed">
											Students
										</Text>
										<Text fw={700}>{stats.total}</Text>
									</Paper>
								</Grid.Col>
								<Grid.Col span={{ base: 6, sm: 3 }}>
									<Paper p="md" withBorder>
										<Text size="sm" c="dimmed">
											Boys
										</Text>
										<Text fw={700}>{stats.boys}</Text>
									</Paper>
								</Grid.Col>
								<Grid.Col span={{ base: 6, sm: 3 }}>
									<Paper p="md" withBorder>
										<Text size="sm" c="dimmed">
											Girls
										</Text>
										<Text fw={700}>{stats.girls}</Text>
									</Paper>
								</Grid.Col>
								<Grid.Col span={{ base: 6, sm: 3 }}>
									<Paper p="md" withBorder>
										<Text size="sm" c="dimmed">
											Capacity Used
										</Text>
										<Text fw={700}>{stats.capacityUsed}</Text>
									</Paper>
								</Grid.Col>
							</Grid>
						</Grid.Col>
					</Grid>

					<Paper p="md" withBorder>
						<Group justify="space-between" mb="md">
							<Title order={4}>Students</Title>
							<Input
								leftSection={<IconSearch size={16} />}
								placeholder="Search student or family"
								w={360}
								onChange={(event) => debouncedChangeKeyword(event.target.value)}
							/>
						</Group>

						<Table.ScrollContainer minWidth={900} maxHeight={520}>
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
									{pageEnrollments.length === 0 ? (
										<Table.Tr>
											<Table.Td colSpan={5}>
												<Text c="dimmed" size="sm" ta="center" py="md">
													No students found.
												</Text>
											</Table.Td>
										</Table.Tr>
									) : (
										pageEnrollments.map((enrollment: any, index: number) => (
											<Table.Tr key={enrollment.id}>
												<Table.Td>{(page - 1) * perPage + index + 1}</Table.Td>
												<Table.Td>
													{`${enrollment.student.firstName} ${enrollment.student.lastName}`}
												</Table.Td>
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
													<Group justify="center">
														<ActionIcon
															color="red"
															disabled={isRemovingStudent}
															onClick={() => handleRemoveStudent(enrollment.student.id)}
														>
															<IconTrash size={16} />
														</ActionIcon>
													</Group>
												</Table.Td>
											</Table.Tr>
										))
									)}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>

						{filteredEnrollments.length > perPage && (
							<Group mt="md" justify="flex-end">
								<Pagination
									total={Math.ceil(filteredEnrollments.length / perPage)}
									value={page}
									onChange={setPage}
								/>
							</Group>
						)}
					</Paper>
				</Stack>
			</Container>
		</>
	);
}
