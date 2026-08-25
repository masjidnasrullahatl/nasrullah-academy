'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Families', href: PATH_APPS.families },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function FamiliesPage() {
	return (
		<>
			<title>Families | Nasrullah Academy</title>

			<Container fluid>
				<Stack>
					<PageHeader title="Families" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
