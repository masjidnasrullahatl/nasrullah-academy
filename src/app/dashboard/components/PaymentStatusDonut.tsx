import { DonutChart } from '@mantine/charts';
import { Group, Paper, Title } from '@mantine/core';

import { PAYMENT_STATUS_COLORS } from '@configs/enums';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type PaymentStatusDonutProps = {
	paymentStatus: DashboardSummary['paymentStatus'];
};

export const PaymentStatusDonut = ({ paymentStatus }: PaymentStatusDonutProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Payment Status
			</Title>
			<Group justify="center">
				<DonutChart
					size={220}
					thickness={28}
					withTooltip
					data={paymentStatus.map((item) => ({
						name: `${item.status} (${item.count})`,
						value: item.amount,
						color: PAYMENT_STATUS_COLORS[item.status],
					}))}
					valueFormatter={formatMoney}
				/>
			</Group>
		</Paper>
	);
};
