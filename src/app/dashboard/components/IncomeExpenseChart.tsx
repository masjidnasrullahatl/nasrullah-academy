import { BarChart } from '@mantine/charts';
import { Paper, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type IncomeExpenseChartProps = {
	data: DashboardSummary['monthly'];
};

export const IncomeExpenseChart = ({ data }: IncomeExpenseChartProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Income vs Expense
			</Title>
			<BarChart
				h={320}
				data={data}
				dataKey="label"
				series={[
					{ name: 'income', label: 'Income', color: 'green' },
					{ name: 'expense', label: 'Expense', color: 'orange' },
				]}
				withLegend
				withTooltip
				valueFormatter={formatMoney}
				tickLine="xy"
			/>
		</Paper>
	);
};
