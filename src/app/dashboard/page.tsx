'use client';

import { useMemo, useState } from 'react';

import { Alert, Container, Loader, SimpleGrid, Stack, Text } from '@mantine/core';

import { useGetDashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { DashboardFilters } from './components/DashboardFilters';
import { GenderDonut } from './components/GenderDonut';
import { IncomeExpenseChart } from './components/IncomeExpenseChart';
import { MonthlySummaryTable } from './components/MonthlySummaryTable';
import { PaymentStatusDonut } from './components/PaymentStatusDonut';
import { ProfitChart } from './components/ProfitChart';
import { StatCards } from './components/StatCards';
import { TopUnpaidFamilies } from './components/TopUnpaidFamilies';

export default function DashboardPage() {
	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState(currentYear);
	const [programId, setProgramId] = useState<string | undefined>();

	const summaryParams = useMemo(
		() => ({
			year,
			programId,
		}),
		[programId, year],
	);

	const {
		data: summary,
		isLoading,
		error,
	} = useGetDashboardSummary(summaryParams);

	return (
		<Container fluid>
			<Stack>
				<title>Dashboard | Masjid Nasrullah School</title>

				<DashboardFilters
					year={year}
					programId={programId}
					onChangeYear={setYear}
					onChangeProgramId={setProgramId}
				/>

				{error && <Alert color="red">{error.message}</Alert>}

				{isLoading || !summary ? (
					<Stack align="center" py="xl">
						<Loader />
						<Text c="dimmed">Loading dashboard data...</Text>
					</Stack>
				) : (
					<>
						<StatCards totals={summary.totals} />
						<IncomeExpenseChart data={summary.monthly} />
						<ProfitChart data={summary.monthly} />
						<SimpleGrid cols={{ base: 1, md: 2 }}>
							<GenderDonut genderSplit={summary.genderSplit} />
							<PaymentStatusDonut paymentStatus={summary.paymentStatus} />
						</SimpleGrid>
						<MonthlySummaryTable monthly={summary.monthly} totals={summary.totals} />
						<TopUnpaidFamilies data={summary.topUnpaidFamilies} />
					</>
				)}
			</Stack>
		</Container>
	);
}
