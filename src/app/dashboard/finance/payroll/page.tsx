'use client';

import { useState } from 'react';

import { Anchor, Container, Paper, Stack, Text } from '@mantine/core';

import PageHeader from '@components/PageHeader';

import { PATH_DASHBOARD, PATH_FINANCE } from '@configs/routes';

import { useGetPayrollPeriodDetail } from '@hooks/react-query/payroll/useGetPayrollPeriodDetail';

import { PayrollEntriesEditor } from './components/PayrollEntriesEditor';
import { PayrollPeriodsTable } from './components/PayrollPeriodsTable';

const items = [
	{ title: 'Dashboard', href: PATH_DASHBOARD.default },
	{ title: 'Finance', href: PATH_FINANCE.root },
	{ title: 'Teacher Payroll', href: PATH_FINANCE.payroll },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function PayrollPage() {
	const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>();
	const { data: selectedPeriod } = useGetPayrollPeriodDetail(selectedPeriodId);

	return (
		<>
			<title>Teacher Payroll | Masjid Nasrullah School</title>
			<Container fluid>
				<Stack>
					<PageHeader title="Teacher Payroll" breadcrumbItems={items} />

					<PayrollPeriodsTable
						selectedPeriodId={selectedPeriodId}
						onSelectPeriod={setSelectedPeriodId}
					/>

					{selectedPeriod ? (
						<Paper p="md" withBorder>
							<PayrollEntriesEditor period={selectedPeriod} />
						</Paper>
					) : (
						<Paper p="md" withBorder>
							<Text c="dimmed">Select a payroll period row to edit entries.</Text>
						</Paper>
					)}
				</Stack>
			</Container>
		</>
	);
}
