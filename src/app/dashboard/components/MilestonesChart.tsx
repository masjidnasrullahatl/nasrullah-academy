import { BarChart } from '@mantine/charts';
import { Group, Paper, Stack, Text, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

type MilestonesChartProps = {
	data: DashboardSummary['milestones'];
	year: number;
};

export const MilestonesChart = ({ data, year }: MilestonesChartProps) => {
	const stats = [
		{ label: 'Juz memorized', value: data.totals.juz, color: 'yellow.7' },
		{ label: 'Books completed', value: data.totals.books, color: 'blue.6' },
		{ label: 'Students', value: data.totals.students, color: 'dark' },
	];

	return (
		<Paper p="md" withBorder>
			<Stack gap="xs" mb="md">
				<Title order={4}>Milestones {year}</Title>
				<Group gap="xl">
					{stats.map((stat) => (
						<div key={stat.label}>
							<Text size="xl" fw={700} c={stat.color}>
								{stat.value}
							</Text>
							<Text size="xs" c="dimmed">
								{stat.label}
							</Text>
						</div>
					))}
				</Group>
			</Stack>
			<BarChart
				h={280}
				data={data.monthly}
				dataKey="label"
				type="stacked"
				series={[
					{ name: 'juz', label: 'Juz memorized', color: 'yellow.6' },
					{ name: 'books', label: 'Books completed', color: 'blue.6' },
				]}
				withLegend
				withTooltip
				allowDecimals={false}
				tickLine="xy"
			/>
		</Paper>
	);
};
