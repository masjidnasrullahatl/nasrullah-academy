'use client';

import { useParams } from 'next/navigation';

import { useMemo } from 'react';

import {
	ActionIcon,
	Anchor,
	Badge,
	Button,
	Container,
	Grid,
	Group,
	Paper,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconEdit, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { useGetFamilyDetail } from '@hooks/react-query/families/useGetFamilyDetail';
import { useDeleteStudent } from '@hooks/react-query/students/useDeleteStudent';

import { StudentForm } from '../../students/components/StudentForm';
import { FamilyForm } from '../components/FamilyForm';

const calcAge = (dateOfBirth?: string | null) => {
	if (!dateOfBirth) {
		return '-';
	}

	return dayjs().diff(dayjs(dateOfBirth), 'year');
};

export default function FamilyDetailPage() {
	const params = useParams<{ id: string }>();
	const familyId = params.id;

	const { data: family } = useGetFamilyDetail(familyId);
	const { mutateAsync: deleteStudent, isPending: isDeletingStudent } =
		useDeleteStudent();

	const items = useMemo(
		() =>
			[
				{ title: 'Dashboard', href: PATH_DASHBOARD.default },
				{ title: 'Apps', href: PATH_APPS.root },
				{ title: 'Families', href: PATH_APPS.families },
				{ title: family?.name || 'Family detail', href: `${PATH_APPS.families}/${familyId}` },
			].map((item, index) => (
				<Anchor href={item.href} key={index}>
					{item.title}
				</Anchor>
			)),
		[family?.name, familyId],
	);

	const handleEditFamily = () => {
		if (!family) {
			return;
		}

		modals.open({
			title: 'Edit Family',
			size: 'xl',
			children: <FamilyForm family={family} />,
		});
	};

	const handleEditStudent = (student: any) => {
		modals.open({
			title: 'Edit Student',
			size: 'lg',
			children: <StudentForm student={student} defaultFamilyId={familyId} />,
		});
	};

	const handleDeleteStudent = (student: any) => {
		modals.openConfirmModal({
			title: 'Delete student?',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				await deleteStudent({ id: student.id });
			},
		});
	};

	return (
		<>
			<title>Family Detail | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader
						title={family?.name || 'Family Detail'}
						breadcrumbItems={items}
						actionButton={
							<Button leftSection={<IconEdit size={16} />} onClick={handleEditFamily}>
								Edit Family
							</Button>
						}
					/>

					<Paper p="md">
						<Grid>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Text fw={700}>Primary Phone</Text>
								<Text>{family?.primaryPhone || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Text fw={700}>Secondary Phone</Text>
								<Text>{family?.secondaryPhone || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 4 }}>
								<Text fw={700}>Email</Text>
								<Text>{family?.email || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 8 }}>
								<Text fw={700}>Address</Text>
								<Text>{family?.address || '-'}</Text>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 2 }}>
								<Text fw={700}>Status</Text>
								<Badge color={family?.status === 'ACTIVE' ? 'green' : 'gray'}>
									{family?.status || '-'}
								</Badge>
							</Grid.Col>
							<Grid.Col span={{ base: 12, md: 2 }}>
								<Text fw={700}>Notes</Text>
								<Text>{family?.notes || '-'}</Text>
							</Grid.Col>
						</Grid>
					</Paper>

					<Paper p="md">
						<Text fw={700} mb="sm">
							Students
						</Text>
						<Table bg="white" border={1}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Name</Table.Th>
									<Table.Th>Gender</Table.Th>
									<Table.Th>Date of birth</Table.Th>
									<Table.Th>Age</Table.Th>
									<Table.Th>Enrolled classes</Table.Th>
									<Table.Th>Teacher</Table.Th>
									<Table.Th>Status</Table.Th>
									<Table.Th ta="center">Actions</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{family?.students?.map((student: any) => (
									<Table.Tr key={student.id}>
										<Table.Td>{`${student.firstName} ${student.lastName}`}</Table.Td>
										<Table.Td>{student.gender}</Table.Td>
										<Table.Td>
											{student.dateOfBirth
												? dayjs(student.dateOfBirth).format('MM/DD/YYYY')
												: '-'}
										</Table.Td>
										<Table.Td>{calcAge(student.dateOfBirth)}</Table.Td>
										<Table.Td>
											<Group gap={4}>
												{student.enrollments?.map((enrollment: any) => (
													<Badge key={enrollment.id} variant="light">
														{enrollment.class.name} ({enrollment.program.code})
													</Badge>
												))}
											</Group>
										</Table.Td>
										<Table.Td>
											{student.enrollments
												?.map((enrollment: any) => {
													const teacher = enrollment.class.teacher;
													return teacher
														? `${teacher.firstName} ${teacher.lastName}`
														: '-';
												})
												.join(', ')}
										</Table.Td>
										<Table.Td>
											<Badge color={student.status === 'ACTIVE' ? 'green' : 'gray'}>
												{student.status}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Group gap="xs" justify="center">
												<ActionIcon onClick={() => handleEditStudent(student)}>
													<IconEdit size={16} />
												</ActionIcon>
												<ActionIcon
													color="red"
													onClick={() => handleDeleteStudent(student)}
													disabled={isDeletingStudent}
												>
													<IconTrash size={16} />
												</ActionIcon>
											</Group>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Paper>

					<Paper p="md">
						<Text fw={700} mb="xs">
							Monthly Invoices
						</Text>
						<Text c="dimmed" size="sm">
							Coming soon — invoice listing for family detail lands in Sprint 5.
						</Text>
					</Paper>
				</Stack>
			</Container>
		</>
	);
}
