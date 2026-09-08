import CountUp from 'react-countup';

import { SimpleGrid, Text, ThemeIcon } from '@mantine/core';

import {
	IconAlertTriangle,
	IconCoin,
	IconTrendingUp,
	IconUsers,
	IconUsersGroup,
	IconWallet,
} from '@tabler/icons-react';

import Surface from '@components/Surface';

import { DashboardSummary } from '@hooks/react-query/dashboard/useGetDashboardSummary';

import { formatMoney } from '@utils/money';

type StatCardsProps = {
	totals: DashboardSummary['totals'];
};

export const StatCards = ({ totals }: StatCardsProps) => {
	return (
		<SimpleGrid cols={{ base: 2, md: 3 }}>
			<Surface feel="bordered">
				<ThemeIcon size="lg" color="blue" variant="light">
					<IconUsers size={18} />
				</ThemeIcon>
				<Text mt="sm" c="dimmed" size="sm">
					Students
				</Text>
				<Text fw={700} size="xl">
					<CountUp end={totals.students} separator="," />
				</Text>
			</Surface>

			<Surface feel="bordered">
				<ThemeIcon size="lg" color="cyan" variant="light">
					<IconUsersGroup size={18} />
				</ThemeIcon>
				<Text mt="sm" c="dimmed" size="sm">
					Families
				</Text>
				<Text fw={700} size="xl">
					<CountUp end={totals.families} separator="," />
				</Text>
			</Surface>

			<Surface feel="bordered">
				<ThemeIcon size="lg" color="green" variant="light">
					<IconCoin size={18} />
				</ThemeIcon>
				<Text mt="sm" c="dimmed" size="sm">
					Income (YTD)
				</Text>
				<Text fw={700} size="xl">
					{formatMoney(totals.income)}
				</Text>
			</Surface>

			<Surface feel="bordered">
				<ThemeIcon size="lg" color="red" variant="light">
					<IconAlertTriangle size={18} />
				</ThemeIcon>
				<Text mt="sm" c="dimmed" size="sm">
					Unpaid Balance
				</Text>
				<Text fw={700} size="xl" c={totals.unpaidBalance > 0 ? 'red' : undefined}>
					{formatMoney(totals.unpaidBalance)}
				</Text>
			</Surface>

			<Surface feel="bordered">
				<ThemeIcon size="lg" color="orange" variant="light">
					<IconWallet size={18} />
				</ThemeIcon>
				<Text mt="sm" c="dimmed" size="sm">
					Expense (YTD)
				</Text>
				<Text fw={700} size="xl" c={totals.expense > 0 ? 'red' : undefined}>
					{formatMoney(totals.expense)}
				</Text>
			</Surface>

			<Surface feel="bordered">
				<ThemeIcon size="lg" color={totals.profit >= 0 ? 'teal' : 'red'} variant="light">
					<IconTrendingUp size={18} />
				</ThemeIcon>
				<Text mt="sm" c="dimmed" size="sm">
					Profit (YTD)
				</Text>
				<Text fw={700} size="xl" c={totals.profit >= 0 ? 'green' : 'red'}>
					{formatMoney(totals.profit)}
				</Text>
			</Surface>
		</SimpleGrid>
	);
};
