'use client';

import { useMemo, useState } from 'react';

import { Alert, Container, Grid, SimpleGrid, Stack } from '@mantine/core';

import { useGetDashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { ClassProfitLossTable } from './components/ClassProfitLossTable';
import { DashboardFilters } from './components/DashboardFilters';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { GenderDonut } from './components/GenderDonut';
import { IncomeChart } from './components/IncomeChart';
import { MilestonesChart } from './components/MilestonesChart';
import { MonthlySummaryTable } from './components/MonthlySummaryTable';
import { PaymentStatusDonut } from './components/PaymentStatusDonut';
import { ProgramSummaryTable } from './components/ProgramSummaryTable';
import { StatCards } from './components/StatCards';
import { TopHifzProgress } from './components/TopHifzProgress';
import { TopUnpaidFamilies } from './components/TopUnpaidFamilies';

export default function DashboardPage() {
	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState(currentYear);
	const [programId, setProgramId] = useState<string | undefined>();

	const summaryParams = useMemo(() => ({ year, programId }), [year, programId]);

	const {
		data: summary,
		isLoading,
		error,
	} = useGetDashboardSummary(summaryParams);

	return (
		<Container fluid>
			<Stack>
				<title>Dashboard | Nasrullah Academy</title>

				<DashboardFilters
					year={year}
					programId={programId}
					onChangeYear={setYear}
					onChangeProgram={setProgramId}
				/>

				{error && <Alert color="red">{error.message}</Alert>}

				{isLoading || !summary ? (
					<DashboardSkeleton />
				) : (
					<>
						<StatCards totals={summary.totals} />
						<SimpleGrid cols={{ base: 1, lg: 3 }}>
							<IncomeChart data={summary.monthly} />
							<GenderDonut genderSplit={summary.genderSplit} />
							<PaymentStatusDonut paymentStatus={summary.paymentStatus} />
						</SimpleGrid>
						<Grid>
							<Grid.Col span={{ base: 12, lg: 8 }}>
								<MilestonesChart data={summary.milestones} year={year} />
							</Grid.Col>
							<Grid.Col span={{ base: 12, lg: 4 }}>
								<TopHifzProgress data={summary.milestones.topHifz} />
							</Grid.Col>
						</Grid>
						<MonthlySummaryTable monthly={summary.monthly} totals={summary.totals} />
						{!programId && <ProgramSummaryTable data={summary.programSummary} />}
						<ClassProfitLossTable data={summary.classProfitLoss} />
						<TopUnpaidFamilies data={summary.topUnpaidFamilies} />
					</>
				)}
			</Stack>
		</Container>
	);
}
