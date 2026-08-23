import { Divider, Group, Paper, Select, Text } from '@mantine/core';

import { IconCalendar } from '@tabler/icons-react';

import { useGetDashboardYears } from '@hooks/react-query/dashboard/useGetDashboardYears';

type DashboardFiltersProps = {
	year: number;
	// eslint-disable-next-line no-unused-vars
	onChangeYear: (value: number) => void;
};

export const DashboardFilters = ({
	year,
	onChangeYear,
}: DashboardFiltersProps) => {
	const { data: years } = useGetDashboardYears();

	return (
		<Paper p="md" withBorder style={{ position: 'sticky', top: 0, zIndex: 20 }}>
			<Text fw={700}>Dashboard Filters</Text>

			<Divider my="xs" />

			<Group wrap="wrap">
				<Select
					label="Year"
					placeholder="Select year"
					leftSection={<IconCalendar size={16} />}
					w={{ base: '100%', sm: 200 }}
					value={String(year)}
					data={(years || [year]).map((yearItem) => ({
						value: String(yearItem),
						label: String(yearItem),
					}))}
					onChange={(value) => onChangeYear(Number(value || year))}
					labelProps={{ mb: 8 }}
				/>
			</Group>
		</Paper>
	);
};
