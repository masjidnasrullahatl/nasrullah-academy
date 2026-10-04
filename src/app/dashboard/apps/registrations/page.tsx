'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Registrations', href: PATH_APPS.registrations },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function RegistrationsPage() {
	return (
		<>
			<title>Registrations | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Registrations" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
