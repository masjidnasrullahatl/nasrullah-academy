'use client';

import { Anchor, Container, Stack } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import { TimesheetForm } from './components/TimesheetForm';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'Timesheet', href: PATH_TEACHER_APPS.timeEntries },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherTimeEntriesPage() {
	return (
		<>
			<title>Timesheet | Nasrullah Academy</title>

			<Container fluid>
				<Stack>
					<PageHeader title="Timesheet" breadcrumbItems={items} />
					<TimesheetForm />
				</Stack>
			</Container>
		</>
	);
}
