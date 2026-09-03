/* eslint-disable no-unused-vars */
import { Group, Input, Select } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import {
	IconCategory,
	IconChalkboard,
	IconCircleDot,
	IconSearch,
} from '@tabler/icons-react';

import { ARCHIVE_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';
import { useGetPagingTeachers } from '@hooks/react-query/teachers/useGetPagingTeachers';

type Props = {
	onChangeFilter: (
		key: 'keyword' | 'teacherId' | 'programId' | 'status',
		value: string,
	) => void;
};

export const TableFilter = ({ onChangeFilter }: Props) => {
	const { data: teachers } = useGetPagingTeachers({ page: 1, limit: 200 });
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value);
	}, 500);

	return (
		<Group wrap="nowrap">
			<Input
				leftSection={<IconSearch size={16} />}
				placeholder="Search class name"
				style={{ flex: 1 }}
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
