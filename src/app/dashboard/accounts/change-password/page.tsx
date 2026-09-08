'use client';

import { Anchor, Container, Grid, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_ACCOUNTS, PATH_DASHBOARD } from '@configs/routes';

import { FormBody } from './components/FormBody';

const breadcrumbItems = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Accounts', href: PATH_ACCOUNTS.root },
	{ title: 'Change Password', href: PATH_ACCOUNTS.changePassword },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function Page() {
	return (
		<Container fluid>
			<Stack gap="lg">
				<title>Change Password | Nasrullah Academy</title>

				<PageHeader title="Change Password" breadcrumbItems={breadcrumbItems} />

				<Grid>
					<Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
						<FormBody />
					</Grid.Col>
				</Grid>
			</Stack>
		</Container>
	);
}
