'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'My Pay', href: PATH_TEACHER_APPS.pay },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherPayPage() {
	return (
		<>
			<title>My Pay | Nasrullah Academy</title>

			<Container fluid>
				<Stack>
					<PageHeader title="My Pay" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
