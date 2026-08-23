'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_DASHBOARD, PATH_FINANCE } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Finance', href: PATH_FINANCE.root },
	{ title: 'Monthly Payments', href: PATH_FINANCE.payments },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function PaymentsPage() {
	return (
		<>
			<title>Monthly Payments | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Monthly Payments" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
