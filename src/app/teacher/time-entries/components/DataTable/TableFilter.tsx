/* eslint-disable no-unused-vars */
import { Select } from '@mantine/core';

import { TeacherPayPeriod } from '@hooks/react-query/teacher/useGetTeacherPayPeriods';

type Props = {
	periods: TeacherPayPeriod[];
	value: string | null;
	onChange: (value: string | null) => void;
};

export const TableFilter = ({ periods, value, onChange }: Props) => {
	return (
		<Select
			label="Pay Period"
			placeholder="Select pay period"
			w={280}
			value={value}
			onChange={onChange}
			labelProps={{ mb: 10 }}
			data={periods.map((period) => ({
				value: period.id,
				label: period.name,
			}))}
		/>
	);
};
