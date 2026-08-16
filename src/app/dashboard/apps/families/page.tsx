'use client';

import { Anchor, Box, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { CreateFamilyButton } from './components/CreateFamilyButton';
import { FamiliesTable } from './components/FamiliesTable';

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
			<title>Families | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Families" breadcrumbItems={items} />
					<Box ml="auto">
						<CreateFamilyButton />
					</Box>
					<FamiliesTable />
				</Stack>
			</Container>
		</>
	);
}
