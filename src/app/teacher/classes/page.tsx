'use client';

import { useMemo, useState } from 'react';

import {
	Anchor,
	Box,
	Center,
	Container,
	Loader,
	Modal,
	Paper,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import dayjs from 'dayjs';

import PageHeader from '@components/PageHeader';

import { GENDER_LABELS } from '@configs/enums';
import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import {
	MyClassRow,
	useGetMyClasses,
} from '@hooks/react-query/teacher/useGetMyClasses';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'My Classes', href: PATH_TEACHER_APPS.classes },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherMyClassesPage() {
	const { data: classes, isLoading } = useGetMyClasses();
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedClass, setSelectedClass] =
		useState<MyClassRow | null>(null);

	const hasData = Boolean(classes?.length);
	const rows = useMemo(
		() =>
			(classes || []).map((item, index) => (
				<Table.Tr
					key={item.id}
					style={{ cursor: 'pointer' }}
					onClick={() => {
						setSelectedClass(item);
						open();
					}}
				>
					<Table.Td>{index + 1}</Table.Td>
					<Table.Td>{item.name}</Table.Td>
					<Table.Td>{item.program.name}</Table.Td>
					<Table.Td ta="center">{item._count.enrollments}</Table.Td>
				</Table.Tr>
			)),
		[classes, open],
	);

	return (
		<Container fluid>
			<Stack>
				<title>My Classes | Nasrullah Academy</title>
				<PageHeader title="My Classes" breadcrumbItems={items} />

				<Paper withBorder p="md">
					{isLoading ? (
						<Center h={260}>
							<Loader />
						</Center>
					) : hasData ? (
						<Table withTableBorder withColumnBorders striped="even">
							<Table.Thead>
								<Table.Tr>
									<Table.Th>#</Table.Th>
									<Table.Th>Class Name</Table.Th>
									<Table.Th>Program</Table.Th>
									<Table.Th ta="center">Students</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
					) : (
						<Center h={260}>
							<Text c="dimmed">You are not assigned to any classes</Text>
						</Center>
					)}
				</Paper>
			</Stack>

			<Modal
				opened={opened}
				onClose={close}
				title={selectedClass ? `Students — ${selectedClass.name}` : 'Students'}
				size="lg"
			>
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
						{selectedClass?.enrollments.length ? (
							selectedClass.enrollments.map((enrollment, index) => (
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
			</Modal>
		</Container>
	);
}
