import { Group, Input, Select } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import { IconCategory, IconSearch, IconTrophy } from '@tabler/icons-react';

import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

import { MILESTONE_TYPE_OPTIONS } from '../../utils';

import type { MilestoneFilterKey } from '.';

type Props = {
	// eslint-disable-next-line no-unused-vars
	onChangeFilter: (key: MilestoneFilterKey, value: string) => void;
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
				placeholder="Search by student, family or book"
				onChange={(event) => debounceChangeKeyword(event.target.value)}
			/>

			<Select
				placeholder="All Programs"
				leftSection={<IconCategory size={16} />}
				data={programs?.data.map((program) => ({
					value: program.id,
					label: program.name,
				}))}
				onChange={(value) => onChangeFilter('programId', value || '')}
				clearable
				searchable
			/>

			<Select
				placeholder="All milestones"
				leftSection={<IconTrophy size={16} />}
				data={MILESTONE_TYPE_OPTIONS}
				onChange={(value) => onChangeFilter('type', value || '')}
				clearable
			/>
		</Group>
	);
};
