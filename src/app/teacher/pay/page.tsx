'use client';

import { Anchor, Center, Container, Loader, Paper, Stack, Table, Text } from '@mantine/core';

import dayjs from 'dayjs';

import PageHeader from '@components/PageHeader';

import { PATH_TEACHER, PATH_TEACHER_APPS } from '@configs/routes';

import { useGetMyPayRecords } from '@hooks/react-query/teacher/useGetMyPayRecords';

import { formatMoney } from '@utils/money';

const items = [
	{ title: 'Teacher', href: PATH_TEACHER.default },
	{ title: 'My Pay', href: PATH_TEACHER_APPS.pay },
].map((item, index) => (
	<Anchor href={item.href} key={index}>
		{item.title}
	</Anchor>
));

export default function TeacherPayPage() {
	const { data: records, isLoading } = useGetMyPayRecords();

	return (
		<Container fluid>
			<Stack>
				<title>My Pay | Nasrullah Academy</title>
				<PageHeader title="My Pay" breadcrumbItems={items} />

				<Paper withBorder p="md">
					{isLoading ? (
						<Center h={260}>
							<Loader />
						</Center>
					) : records?.length ? (
						<Table withTableBorder withColumnBorders striped="even">
							<Table.Thead>
								<Table.Tr>
									<Table.Th>#</Table.Th>
									<Table.Th>Period</Table.Th>
									<Table.Th ta="right">Total Hours</Table.Th>
									<Table.Th ta="right">Hourly Rate</Table.Th>
									<Table.Th ta="right">Total Pay</Table.Th>
									<Table.Th ta="center">Status</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{records.map((record, index) => (
									<Table.Tr key={record.id}>
										<Table.Td>{index + 1}</Table.Td>
										<Table.Td>
											{record.payPeriod.name} ({dayjs(record.payPeriod.startDate).format('MM/DD/YYYY')} - {dayjs(record.payPeriod.endDate).format('MM/DD/YYYY')})
										</Table.Td>
										<Table.Td ta="right">{record.totalHours.toFixed(2)}</Table.Td>
										<Table.Td ta="right">{formatMoney(record.hourlyRate)}</Table.Td>
										<Table.Td ta="right">{formatMoney(record.totalPay)}</Table.Td>
										<Table.Td ta="center">
											{record.payPeriod.status === 'PAID' ? 'Paid' : 'Pending'}
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					) : (
						<Center h={220}>
							<Text c="dimmed">No pay records yet</Text>
						</Center>
					)}
				</Paper>
			</Stack>
		</Container>
	);
}
