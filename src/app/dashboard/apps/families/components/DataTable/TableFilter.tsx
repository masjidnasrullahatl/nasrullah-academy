import { Group, Input, Select } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import { IconCategory, IconCircleDot, IconSearch } from '@tabler/icons-react';

import { RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

type Props = {
	onChangeFilter: (
		// eslint-disable-next-line no-unused-vars
		key: 'keyword' | 'programId' | 'status',
		// eslint-disable-next-line no-unused-vars
		value: string,
	) => void;
};

export const TableFilter = ({ onChangeFilter }: Props) => {
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value);
	}, 500);

	return (
		<Group justify="end" w="100%" wrap="wrap">
			<Input
				flex={1}
				leftSection={<IconSearch size={16} />}
				placeholder="Search by family name, parent name, phone, email, ..."
				onChange={(event) => debounceChangeKeyword(event.target.value)}
			/>

			<Select
				placeholder="All Programs"
				leftSection={<IconCategory size={16} />}
				clearable
				searchable
				data={programs?.data.map((program) => ({
					value: program.id,
					label: program.name,
				}))}
				onChange={(value) => onChangeFilter('programId', value || '')}
			/>

			<Select
				placeholder="Filter by status"
				leftSection={<IconCircleDot size={16} />}
				data={RECORD_STATUS_OPTIONS}
				onChange={(value) => onChangeFilter('status', value || '')}
				clearable
			/>
		</Group>
	);
};
