import { LineChart } from '@mantine/charts';
import { Paper, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

type ProfitChartProps = {
	data: DashboardSummary['monthly'];
};

export const ProfitChart = ({ data }: ProfitChartProps) => {
	const transformedData = data.map((item) => ({
		...item,
		profitMarginPct: item.profitMargin * 100,
	}));

	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Profit & Profit Margin
			</Title>
			<LineChart
				h={320}
				data={transformedData}
				dataKey="label"
				series={[
					{ name: 'profit', label: 'Profit', color: 'blue' },
					{ name: 'profitMarginPct', label: 'Profit Margin (%)', color: 'grape', yAxisId: 'right' },
				]}
				withLegend
				withTooltip
				withRightYAxis
				rightYAxisLabel="Profit Margin (%)"
				tickLine="xy"
			/>
		</Paper>
	);
};
