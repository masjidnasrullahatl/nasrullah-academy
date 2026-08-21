import { DonutChart } from '@mantine/charts';
import { Group, Paper, Text, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

type GenderDonutProps = {
	genderSplit: DashboardSummary['genderSplit'];
};

export const GenderDonut = ({ genderSplit }: GenderDonutProps) => {
	const total = genderSplit.boys + genderSplit.girls;

	return (
		<Paper p="md" withBorder>
			<Title order={4} mb="md">
				Gender Split
			</Title>
			<Group justify="center">
				<DonutChart
					size={220}
					thickness={28}
					withTooltip
					chartLabel={total}
					data={[
						{ name: 'Boys', value: genderSplit.boys, color: 'blue' },
						{ name: 'Girls', value: genderSplit.girls, color: 'pink' },
					]}
				/>
			</Group>
			<Text ta="center" c="dimmed" size="sm" mt="sm">
				Total students: {total}
			</Text>
		</Paper>
	);
};
