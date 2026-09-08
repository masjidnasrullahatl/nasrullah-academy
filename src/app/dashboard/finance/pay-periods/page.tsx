'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_DASHBOARD, PATH_FINANCE } from '@configs/routes';

import { DataTable } from './components/DataTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Finance', href: PATH_FINANCE.root },
	{ title: 'Pay Periods', href: PATH_FINANCE.payPeriods },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function PayPeriodsPage() {
	return (
		<>
			<title>Pay Periods | Nasrullah Academy</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Pay Periods" breadcrumbItems={items} />
					<DataTable />
				</Stack>
			</Container>
		</>
	);
}
