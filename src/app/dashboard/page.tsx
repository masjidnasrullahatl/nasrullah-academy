'use client';

import { useMemo, useState } from 'react';

import { Alert, Container, Grid, SimpleGrid, Stack } from '@mantine/core';

import dayjs from 'dayjs';

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
	const [month, setMonth] = useState<number | undefined>();
	const [programId, setProgramId] = useState<string | undefined>();

	const summaryParams = useMemo(
		() => ({ year, month, programId }),
		[year, month, programId],
	);

	// "October 2026" for one month, "2026" for the whole year
	const periodLabel = month
		? dayjs(new Date(year, month - 1, 1)).format('MMMM YYYY')
		: String(year);

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
					month={month}
					programId={programId}
					onChangeYear={setYear}
					onChangeMonth={setMonth}
					onChangeProgram={setProgramId}
				/>

				{error && <Alert color="red">{error.message}</Alert>}

				{isLoading || !summary ? (
					<DashboardSkeleton />
				) : (
					<>
						<StatCards totals={summary.totals} period={month ? periodLabel : 'YTD'} />
						<SimpleGrid cols={{ base: 1, lg: 3 }}>
							<IncomeChart data={summary.monthly} />
							<GenderDonut genderSplit={summary.genderSplit} />
							<PaymentStatusDonut paymentStatus={summary.paymentStatus} />
						</SimpleGrid>
						<Grid>
							<Grid.Col span={{ base: 12, lg: 8 }}>
								<MilestonesChart data={summary.milestones} period={periodLabel} />
							</Grid.Col>
							<Grid.Col span={{ base: 12, lg: 4 }}>
								<TopHifzProgress data={summary.milestones.topHifz} />
							</Grid.Col>
						</Grid>
						<MonthlySummaryTable monthly={summary.monthly} totals={summary.totals} />
						{!programId && (
							<ProgramSummaryTable
								data={summary.programSummary}
								uniqueStudents={summary.totals.students}
							/>
						)}
						<ClassProfitLossTable data={summary.classProfitLoss} />
						<TopUnpaidFamilies data={summary.topUnpaidFamilies} />
					</>
				)}
			</Stack>
		</Container>
	);
}
