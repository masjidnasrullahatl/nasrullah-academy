import { Group, Input, Select } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import { IconCircleDot, IconSearch } from '@tabler/icons-react';

import { RECORD_STATUS_OPTIONS } from '@configs/enums';

type Props = {
	// eslint-disable-next-line no-unused-vars
	onChangeFilter: (key: 'keyword' | 'status', value: string) => void;
};

export const TableFilter = ({ onChangeFilter }: Props) => {
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
				placeholder="Filter by status"
				leftSection={<IconCircleDot size={16} />}
				data={RECORD_STATUS_OPTIONS}
				onChange={(value) => onChangeFilter('status', value || '')}
				clearable
			/>
		</Group>
	);
};
