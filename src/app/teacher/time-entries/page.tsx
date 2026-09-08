'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'Time Entry', href: PATH_TEACHER_APPS.timeEntries },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherTimeEntriesPage() {
	return (
		<>
			<title>Time Entry | Nasrullah Academy</title>

			<Container fluid>
				<Stack>
					<PageHeader title="Time Entry" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
