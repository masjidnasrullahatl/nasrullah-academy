import { Group, Input, Select } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import {
	IconChalkboard,
	IconCircleDot,
	IconSearch,
} from '@tabler/icons-react';

import { ARCHIVE_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

type Props = {
	// eslint-disable-next-line no-unused-vars
	onChangeFilter: (key: 'keyword' | 'teacherId' | 'status', value: string) => void;
};

export const TableFilter = ({ onChangeFilter }: Props) => {
	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value);
	}, 500);

	return (
		<Group mb="md" wrap="nowrap">
			<Input
				leftSection={<IconSearch size={16} />}
				placeholder="Search class name"
				style={{ flex: 1 }}
				onChange={(event) => debounceChangeKeyword(event.target.value)}
			/>

			<Select
				placeholder="Teacher"
				leftSection={<IconChalkboard size={16} />}
				clearable
				searchable
				data={teachers?.data.map((teacher) => ({
					value: teacher.id,
					label: `${teacher.firstName} ${teacher.lastName}`,
				}))}
				onChange={(value) => onChangeFilter('teacherId', value || '')}
			/>
			<Select
				placeholder="Status"
				leftSection={<IconCircleDot size={16} />}
				clearable
				data={ARCHIVE_STATUS_OPTIONS}
				onChange={(value) => onChangeFilter('status', value || '')}
			/>
		</Group>
	);
};
