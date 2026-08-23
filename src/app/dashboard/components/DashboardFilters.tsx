import { Group, Paper, Select } from '@mantine/core';

import { IconCalendar } from '@tabler/icons-react';

import { useGetDashboardYears } from '@hooks/react-query/dashboard/useGetDashboardYears';

type DashboardFiltersProps = {
	year: number;
	onChangeYear: any;
};

export const DashboardFilters = ({
	year,
	onChangeYear,
}: DashboardFiltersProps) => {
	const { data: years } = useGetDashboardYears();

	return (
		<Paper p="md" withBorder style={{ position: 'sticky', top: 0, zIndex: 20 }}>
			<Group wrap="wrap">
				<Select
					label="Year"
					placeholder="Select year"
					leftSection={<IconCalendar size={16} />}
					w={{ base: '100%', sm: 140 }}
					value={String(year)}
					clearable
					data={(years || [year]).map((yearItem) => ({
						value: String(yearItem),
						label: String(yearItem),
					}))}
					onChange={(value) => onChangeYear(Number(value || year))}
				/>
			</Group>
		</Paper>
	);
};
