'use client';

import { useMemo, useState } from 'react';

import { Alert, Container, SimpleGrid, Stack } from '@mantine/core';

import { useGetDashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { DashboardFilters } from './components/DashboardFilters';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { GenderDonut } from './components/GenderDonut';
import { IncomeChart } from './components/IncomeChart';
import { MonthlySummaryTable } from './components/MonthlySummaryTable';
import { PaymentStatusDonut } from './components/PaymentStatusDonut';
import { StatCards } from './components/StatCards';
import { TopUnpaidFamilies } from './components/TopUnpaidFamilies';

export default function DashboardPage() {
	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState(currentYear);

	const summaryParams = useMemo(() => ({ year }), [year]);

	const {
		data: summary,
		isLoading,
		error,
	} = useGetDashboardSummary(summaryParams);

	return (
		<Container fluid>
			<Stack>
				<title>Dashboard | Masjid Nasrullah School</title>

				<DashboardFilters year={year} onChangeYear={setYear} />

				{error && <Alert color="red">{error.message}</Alert>}

				{isLoading || !summary ? (
					<DashboardSkeleton />
				) : (
					<>
						<StatCards totals={summary.totals} />
						<IncomeChart data={summary.monthly} />
						<SimpleGrid cols={{ base: 1, md: 2 }}>
							<GenderDonut genderSplit={summary.genderSplit} />
							<PaymentStatusDonut paymentStatus={summary.paymentStatus} />
						</SimpleGrid>
						<MonthlySummaryTable
							monthly={summary.monthly}
							totals={summary.totals}
						/>
						<TopUnpaidFamilies data={summary.topUnpaidFamilies} />
					</>
				)}
			</Stack>
		</Container>
	);
}
