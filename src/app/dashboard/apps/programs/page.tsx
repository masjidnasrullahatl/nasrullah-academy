'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { ProgramsTable } from './components/ProgramsTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Programs', href: PATH_APPS.programs },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function ProgramsPage() {
	return (
		<>
			<title>Programs | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Programs" breadcrumbItems={items} />
					<ProgramsTable />
				</Stack>
			</Container>
		</>
	);
}
