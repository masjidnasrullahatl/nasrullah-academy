'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { TeachersTable } from './components/TeachersTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Teachers', href: PATH_APPS.teachers },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeachersPage() {
	return (
		<>
			<title>Teachers | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Teachers" breadcrumbItems={items} />
					<TeachersTable />
				</Stack>
			</Container>
		</>
	);
}
