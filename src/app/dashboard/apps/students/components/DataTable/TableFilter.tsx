/* eslint-disable no-unused-vars */
import { useMemo } from 'react';

import { Group, Input, Select } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import {
	IconCircleDot,
	IconGenderBigender,
	IconSchool,
	IconSearch,
	IconUsersGroup,
} from '@tabler/icons-react';

import { GENDER_OPTIONS, RECORD_STATUS_OPTIONS } from '@configs/enums';

import { useGetPagingClasses } from '@hooks/react-query/classes/useGetPagingClasses';
import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';

type Props = {
	onChangeFilter: (
		key: 'keyword' | 'familyId' | 'classId' | 'gender' | 'status',
		value: string,
	) => void;
};

export const TableFilter = ({ onChangeFilter }: Props) => {
	const { data: families } = useGetPagingFamilies({
		page: 1,
		limit: 1000,
	});
	const { data: classes } = useGetPagingClasses({
		page: 1,
		limit: 1000,
	});

	const classOptions = useMemo(
		() =>
			classes?.data.map((item) => ({
				value: item.id,
				label: item.name,
			})) || [],
		[classes],
	);

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value);
	}, 500);

	return (
		<Group justify="end" w="100%" wrap="wrap">
			<Input
				flex={1}
				leftSection={<IconSearch size={16} />}
				placeholder="Search by student name or family"
				onChange={(event) => debounceChangeKeyword(event.target.value)}
			/>

			<Select
				placeholder="Family"
				leftSection={<IconUsersGroup size={16} />}
				data={families?.data.map((family) => ({
					value: family.id,
					label: family.name,
				}))}
				onChange={(value) => onChangeFilter('familyId', value || '')}
				clearable
				searchable
			/>

			<Select
				placeholder="Class"
				leftSection={<IconSchool size={16} />}
				data={classOptions}
				onChange={(value) => onChangeFilter('classId', value || '')}
				clearable
				searchable
			/>

			<Select
				placeholder="Gender"
				leftSection={<IconGenderBigender size={16} />}
				data={GENDER_OPTIONS}
				onChange={(value) => onChangeFilter('gender', value || '')}
				clearable
				w={120}
			/>

			<Select
				placeholder="Status"
				leftSection={<IconCircleDot size={16} />}
				data={RECORD_STATUS_OPTIONS}
				onChange={(value) => onChangeFilter('status', value || '')}
				clearable
				w={120}
			/>
		</Group>
	);
};
