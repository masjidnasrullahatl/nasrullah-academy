import { BarChart } from '@mantine/charts';
import { Paper, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type IncomeChartProps = {
	data: DashboardSummary['monthly'];
};

export const IncomeChart = ({ data }: IncomeChartProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Monthly Income
			</Title>
			<BarChart
				h={320}
				data={data}
				dataKey="label"
				series={[{ name: 'income', label: 'Income', color: 'green' }]}
				withTooltip
				valueFormatter={formatMoney}
				tickLine="xy"
			/>
		</Paper>
	);
};
