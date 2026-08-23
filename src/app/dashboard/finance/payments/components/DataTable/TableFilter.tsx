import { Group, Select, SimpleGrid, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import {
	IconCalendar,
	IconCalendarMonth,
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

type FilterValue = {
	year: number;
	month: number;
	familyId?: string;
	payMethod?: string;
	paymentStatus?: string;
};

type Props = {
	filter: FilterValue;
	currentDate: Date;
	// eslint-disable-next-line no-unused-vars
	onChangeFilter: (key: 'year' | 'month' | 'familyId' | 'payMethod' | 'paymentStatus' | 'keyword', value: string | number) => void;
};

export const TableFilter = ({ filter, currentDate, onChangeFilter }: Props) => {
	const { data: families } = useGetPagingFamilies({ page: 1, limit: 500 });

	const debounceChangeKeyword = useDebouncedCallback((value: string) => {
		onChangeFilter('keyword', value || '');
	}, 500);

	return (
		<Group>
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 6 }} spacing="xs" mb="md">
				<Select
					placeholder="Year"
					leftSection={<IconCalendar size={16} />}
					clearable
					data={Array.from({ length: 8 }).map((_, index) => {
						const year = currentDate.getFullYear() - 2 + index;
						return { value: String(year), label: String(year) };
					})}
					value={String(filter.year)}
					onChange={(value) =>
						onChangeFilter('year', Number(value || currentDate.getFullYear()))
					}
				/>
				<Select
					placeholder="Month"
					leftSection={<IconCalendarMonth size={16} />}
					clearable
					data={MONTH_OPTIONS}
					value={String(filter.month)}
					onChange={(value) =>
						onChangeFilter('month', Number(value || currentDate.getMonth() + 1))
					}
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
				<TextInput
					leftSection={<IconSearch size={16} />}
					placeholder="Search family name or phone"
					onChange={(event) => debounceChangeKeyword(event.target.value)}
				/>
			</SimpleGrid>
		</Group>
	);
};
