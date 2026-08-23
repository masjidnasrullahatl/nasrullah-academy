'use client';

import { Anchor, Button, Container, Stack } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconPlus } from '@tabler/icons-react';

import PageHeader from '@components/PageHeader';

import { PATH_APPS, PATH_DASHBOARD } from '@configs/routes';

import { ClassesTable } from './components/ClassesTable';
import { ClassFormModal } from './components/ClassFormModal';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Apps', href: PATH_APPS.root },
	{ title: 'Classes', href: PATH_APPS.classes },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function ClassesPage() {
	const handleCreateClass = () => {
		modals.open({
			title: 'Create Class',
			size: 'md',
			children: <ClassFormModal />,
		});
	};

	return (
		<>
			<title>Classes | Masjid Nasrullah School</title>

			<Container fluid>
				<Stack>
					<PageHeader
						title="Classes"
						breadcrumbItems={items}
						actionButton={
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={handleCreateClass}
							>
								Create class
							</Button>
						}
					/>
					<ClassesTable />
				</Stack>
			</Container>
		</>
	);
}
