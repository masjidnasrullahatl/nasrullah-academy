'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_DASHBOARD, PATH_FINANCE } from '@configs/routes';

import { ScholarshipsTable } from './components/ScholarshipsTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Finance', href: PATH_FINANCE.root },
	{ title: 'Scholarships', href: PATH_FINANCE.scholarships },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function ScholarshipsPage() {
	return (
		<>
			<title>Scholarships | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Scholarships" breadcrumbItems={items} />
					<ScholarshipsTable />
				</Stack>
			</Container>
		</>
	);
}
