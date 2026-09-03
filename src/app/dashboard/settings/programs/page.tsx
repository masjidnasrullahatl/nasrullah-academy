'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_DASHBOARD, PATH_SETTINGS } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Settings', href: PATH_SETTINGS.root },
	{ title: 'Programs', href: PATH_SETTINGS.programs },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function ProgramsPage() {
	return (
		<>
			<title>Programs | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Programs" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
