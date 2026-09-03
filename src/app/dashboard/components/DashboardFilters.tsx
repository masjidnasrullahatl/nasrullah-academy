import { Divider, Group, Paper, Select, Text } from '@mantine/core';

import { IconCalendar, IconCategory } from '@tabler/icons-react';

import { useGetDashboardYears } from '@hooks/react-query/dashboard/useGetDashboardYears';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

type DashboardFiltersProps = {
	year: number;
	programId?: string;
	// eslint-disable-next-line no-unused-vars
	onChangeYear: (value: number) => void;
	// eslint-disable-next-line no-unused-vars
	onChangeProgram: (value?: string) => void;
};

export const DashboardFilters = ({
	year,
	programId,
	onChangeYear,
	onChangeProgram,
}: DashboardFiltersProps) => {
	const { data: years } = useGetDashboardYears();
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

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

				<Select
					label="Program"
					placeholder="All Programs"
					leftSection={<IconCategory size={16} />}
					clearable
					searchable
					w={{ base: '100%', sm: 240 }}
					value={programId || null}
					data={programs?.data.map((program) => ({
						value: program.id,
						label: program.name,
					}))}
					onChange={(value) => onChangeProgram(value || undefined)}
					labelProps={{ mb: 8 }}
				/>
			</Group>
		</Paper>
	);
};
