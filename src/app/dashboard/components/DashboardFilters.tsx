import { Group, Paper, Select } from '@mantine/core';

import { useGetDashboardYears } from '@hooks/react-query/dashboard/useGetDashboardYears';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

type DashboardFiltersProps = {
	year: number;
	programId?: string;
	onChangeYear: any;
	onChangeProgramId: any;
};

export const DashboardFilters = ({
	year,
	programId,
	onChangeYear,
	onChangeProgramId,
}: DashboardFiltersProps) => {
	const { data: years } = useGetDashboardYears();
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

	return (
		<Paper p="md" withBorder style={{ position: 'sticky', top: 0, zIndex: 20 }}>
			<Group wrap="wrap">
				<Select
					label="Year"
					w={{ base: '100%', sm: 140 }}
					value={String(year)}
					data={(years || [year]).map((yearItem) => ({
						value: String(yearItem),
						label: String(yearItem),
					}))}
					onChange={(value) => onChangeYear(Number(value || year))}
				/>
				<Select
					label="Program"
					w={{ base: '100%', sm: 240 }}
					value={programId || ''}
					data={[
						{ value: '', label: 'All programs' },
						...((programs?.data || []).map((program) => ({
							value: program.id,
							label: program.name,
						})) as Array<{ value: string; label: string }>),
					]}
					onChange={(value) => onChangeProgramId(value || undefined)}
				/>
			</Group>
		</Paper>
	);
};
