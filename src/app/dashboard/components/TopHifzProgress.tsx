import { Divider, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

const JUZ_COUNT = 30;

type TopHifzProgressProps = {
	data: DashboardSummary['milestones']['topHifz'];
};

export const TopHifzProgress = ({ data }: TopHifzProgressProps) => {
	return (
		<Paper p="md" withBorder>
			<Title order={4}>Top Hifz Progress</Title>
			<Text size="xs" c="dimmed">
				Juz memorized, all time
			</Text>

			<Divider my="md" />

			{data.length === 0 ? (
				<Text size="sm" c="dimmed">
					No Juz recorded yet
				</Text>
			) : (
				<Stack gap="sm">
					{data.map((item, index) => (
						<Stack key={item.studentId} gap={4}>
							<Group justify="space-between" wrap="nowrap">
								<Text size="sm" fw={500} truncate>
									{index + 1}. {item.name}
									<Text span size="xs" c="dimmed">
										{' '}
										{item.familyName}
									</Text>
								</Text>
								<Text size="sm" fw={700} c="yellow.8">
									{item.juz}/{JUZ_COUNT}
								</Text>
							</Group>
							<Progress
								value={(item.juz / JUZ_COUNT) * 100}
								color="yellow"
								size="sm"
							/>
						</Stack>
					))}
				</Stack>
			)}
		</Paper>
	);
};
