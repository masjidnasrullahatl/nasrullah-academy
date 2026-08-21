'use client';

import { useState } from 'react';

import {
	Alert,
	Anchor,
	Button,
	Container,
	Group,
	Input,
	Pagination,
	Paper,
	Select,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { modals } from '@mantine/modals';

import { IconAlertCircle, IconPlus, IconSchool, IconSearch } from '@tabler/icons-react';

import PageHeader from '@components/PageHeader';

import { ARCHIVE_STATUS_OPTIONS, CLASS_SESSION_OPTIONS } from '@configs/enums';
import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

import { ClassCard } from './components/ClassCard';
import { ClassFormModal } from './components/ClassFormModal';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Classes', href: PATH_APPS.classes },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function ClassesPage() {
	const currentYear = new Date().getFullYear();
	const limit = 20;

	const [page, setPage] = useState(1);
	const [filter, setFilter] = useState<{
		keyword?: string;
		programId?: string;
		teacherId?: string;
		schoolYear?: number;
		session?: 'AM' | 'PM' | 'AM_PM' | 'NA';
		status?: 'ACTIVE' | 'ARCHIVED';
	}>({ schoolYear: currentYear });

	const {
		data: classes,
		isLoading,
		isError,
		error,
	} = useGetPagingClasses({
		page,
		limit,
		keyword: filter.keyword,
		programId: filter.programId,
		teacherId: filter.teacherId,
		schoolYear: filter.schoolYear,
		session: filter.session,
		status: filter.status,
	});

	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });
	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });

	const handleChangeFilter = (
		key: 'keyword' | 'programId' | 'teacherId' | 'schoolYear' | 'session' | 'status',
		value: any,
	) => {
		setFilter({ ...filter, [key]: value });
		setPage(1);
	};

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		handleChangeFilter('keyword', value);
	}, 500);

	const handleCreateClass = () => {
		modals.open({
			title: 'Create Class',
			size: 'lg',
			children: <ClassFormModal />,
		});
	};

	const hasData = Boolean(classes?.total);

	return (
		<>
			<title>Classes | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader
						title="Classes"
						breadcrumbItems={items}
						actionButton={
							<Button leftSection={<IconPlus size={16} />} onClick={handleCreateClass}>
								Create class
							</Button>
						}
					/>

					<Group wrap="wrap">
						<Input
							leftSection={<IconSearch size={16} />}
							placeholder="Search class name"
							style={{ flex: 1 }}
							onChange={(event) => debounceChangeKeyword(event.target.value)}
						/>
						<Select
							placeholder="School year"
							value={filter.schoolYear?.toString() || ''}
							data={Array.from({ length: 8 }).map((_, index) => {
								const year = currentYear - 2 + index;
								return { value: year.toString(), label: year.toString() };
							})}
							onChange={(value) =>
								handleChangeFilter('schoolYear', value ? Number(value) : undefined)
							}
						/>
						<Select
							placeholder="Program"
							clearable
							searchable
							data={programs?.data.map((program) => ({
								value: program.id,
								label: program.name,
							}))}
							onChange={(value) => handleChangeFilter('programId', value || undefined)}
						/>
						<Select
							placeholder="Teacher"
							clearable
							searchable
							data={teachers?.data.map((teacher) => ({
								value: teacher.id,
								label: `${teacher.firstName} ${teacher.lastName}`,
							}))}
							onChange={(value) => handleChangeFilter('teacherId', value || undefined)}
						/>
						<Select
							placeholder="Session"
							clearable
							data={CLASS_SESSION_OPTIONS}
							onChange={(value) => handleChangeFilter('session', value || undefined)}
						/>
						<Select
							placeholder="Status"
							clearable
							data={ARCHIVE_STATUS_OPTIONS}
							onChange={(value) => handleChangeFilter('status', value || undefined)}
						/>
					</Group>

					{isError && (
						<Alert color="red" icon={<IconAlertCircle size={16} />}>
							{error.message}
						</Alert>
					)}

					{isLoading ? (
						<SimpleGrid cols={{ base: 1, lg: 2 }}>
							{Array.from({ length: 4 }).map((_, index) => (
								<Paper key={index} withBorder p="md">
									<Stack>
										<Skeleton h={24} w="45%" />
										<Skeleton h={18} w="70%" />
										<Skeleton h={120} w="100%" />
									</Stack>
								</Paper>
							))}
						</SimpleGrid>
					) : hasData ? (
						<SimpleGrid cols={{ base: 1, lg: 2 }}>
							{classes?.data.map((classItem) => (
								<ClassCard key={classItem.id} classItem={classItem} />
							))}
						</SimpleGrid>
					) : (
						<Stack align="center" py="xl">
							<IconSchool size={42} color="var(--theme-primary-color)" />
							<Text fw={600}>No classes found</Text>
							<Button onClick={handleCreateClass}>Create class</Button>
						</Stack>
					)}

					{(classes?.total || 0) > limit && (
						<Group justify="flex-end">
							<Pagination
								total={Math.ceil((classes?.total || 0) / limit)}
								value={page}
								onChange={setPage}
							/>
						</Group>
					)}
				</Stack>
			</Container>
		</>
	);
}
