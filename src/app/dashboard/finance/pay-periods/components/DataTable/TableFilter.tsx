/* eslint-disable no-unused-vars */
import { Group, Select, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import { IconCircleDot, IconSearch } from '@tabler/icons-react';

import { PAY_PERIOD_STATUS_OPTIONS } from '@configs/enums';

type Props = {
	onChangeFilter: (key: 'keyword' | 'status', value: string) => void;
};

export const TableFilter = ({ onChangeFilter }: Props) => {
	const debounceKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value);
	}, 500);

	return (
		<Group grow>
			<TextInput
				leftSection={<IconSearch size={16} />}
				placeholder="Search pay period"
				onChange={(event) => debounceKeyword(event.target.value)}
			/>

			<Select
				placeholder="All status"
				leftSection={<IconCircleDot size={16} />}
				clearable
				data={PAY_PERIOD_STATUS_OPTIONS}
				onChange={(value) => onChangeFilter('status', value || '')}
			/>
		</Group>
	);
};
