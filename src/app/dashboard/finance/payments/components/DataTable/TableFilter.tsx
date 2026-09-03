/* eslint-disable no-unused-vars */
import { Group, Select, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import {
	IconCalendar,
	IconCalendarMonth,
	IconCategory,
	IconCircleDot,
	IconCreditCard,
	IconSearch,
	IconUsersGroup,
} from '@tabler/icons-react';

import {
	MONTH_OPTIONS,
	PAY_METHOD_OPTIONS,
	PAYMENT_STATUS_OPTIONS,
} from '@configs/enums';

import { useGetPagingFamilies } from '@hooks/react-query/families/useGetPagingFamilies';
import { useGetPagingPrograms } from '@hooks/react-query/programs/useGetPagingPrograms';

type FilterValue = {
	year?: number;
	month?: number;
	programId?: string;
	familyId?: string;
	payMethod?: string;
	paymentStatus?: string;
};

type Props = {
	filter: FilterValue;
	onChangeFilter: (
		key:
			| 'year'
			| 'month'
			| 'programId'
			| 'familyId'
			| 'payMethod'
			| 'paymentStatus'
			| 'keyword',
		value: string | number,
	) => void;
};

export const TableFilter = ({ filter, onChangeFilter }: Props) => {
	const { data: families } = useGetPagingFamilies({ page: 1, limit: 500 });
	const { data: programs } = useGetPagingPrograms({ page: 1, limit: 100 });

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value || '');
	}, 500);

	return (
		<Stack>
			<TextInput
				leftSection={<IconSearch size={16} />}
				placeholder="Search family name or phone"
				onChange={(event) => debounceChangeKeyword(event.target.value)}
			/>

			<Group>
				<SimpleGrid
					mb="md"
					spacing="xs"
					cols={{ base: 1, sm: 2, md: 4, lg: 6 }}
				>
					<Select
						placeholder="Year"
						leftSection={<IconCalendar size={16} />}
						clearable
						data={Array.from({ length: 8 }).map((_, index) => {
							const currentDate = new Date();
							const year = currentDate.getFullYear() - 2 + index;
							return { value: String(year), label: String(year) };
						})}
						value={filter.year ? String(filter.year) : null}
						onChange={(value) => onChangeFilter('year', value ? Number(value) : '')}
					/>

					<Select
						placeholder="Month"
						leftSection={<IconCalendarMonth size={16} />}
						clearable
						data={MONTH_OPTIONS}
						value={filter.month ? String(filter.month) : null}
						onChange={(value) => onChangeFilter('month', value ? Number(value) : '')}
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
						value={filter.programId || null}
						onChange={(value) => onChangeFilter('programId', value || '')}
					/>

					<Select
						placeholder="All families"
						leftSection={<IconUsersGroup size={16} />}
						clearable
						searchable
						data={families?.data.map((family) => ({
							value: family.id,
							label: family.name,
						}))}
						value={filter.familyId || null}
						onChange={(value) => onChangeFilter('familyId', value || '')}
					/>

					<Select
						placeholder="All methods"
						leftSection={<IconCreditCard size={16} />}
						clearable
						data={PAY_METHOD_OPTIONS}
						value={filter.payMethod || null}
						onChange={(value) => onChangeFilter('payMethod', value || '')}
					/>

					<Select
						placeholder="All statuses"
						leftSection={<IconCircleDot size={16} />}
						clearable
						data={PAYMENT_STATUS_OPTIONS}
						value={filter.paymentStatus || null}
						onChange={(value) => onChangeFilter('paymentStatus', value || '')}
					/>
				</SimpleGrid>
			</Group>
		</Stack>
	);
};
