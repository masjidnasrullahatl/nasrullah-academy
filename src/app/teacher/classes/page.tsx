'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'My Classes', href: PATH_TEACHER_APPS.classes },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherMyClassesPage() {
	return (
		<>
			<title>My Classes | Nasrullah Academy</title>

			<Container fluid>
				<Stack>
					<PageHeader title="My Classes" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
