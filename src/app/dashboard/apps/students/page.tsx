'use client';

import { Anchor, Box, Button, Container, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconPlus } from '@tabler/icons-react';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { StudentForm } from './components/StudentForm';
import { StudentsTable } from './components/StudentsTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Students', href: PATH_APPS.students },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function StudentsPage() {
	const handleCreate = () => {
		modals.open({
			title: 'Create Student',
			size: 'lg',
			children: <StudentForm />,
		});
	};

	return (
		<>
			<title>Students | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Students" breadcrumbItems={items} />
					<Box ml="auto">
						<Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
							New Student
						</Button>
					</Box>
					<StudentsTable />
				</Stack>
			</Container>
		</>
	);
}
