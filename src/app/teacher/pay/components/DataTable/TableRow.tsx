import { Table } from '@mantine/core';

import dayjs from 'dayjs';

import { MyPayRecord } from '@hooks/react-query/teacher/useGetMyPayRecords';

import { formatMoney } from '@utils/money';

type Props = {
	record: MyPayRecord;
	index: number;
};

export const TableRow = ({ record, index }: Props) => {
	return (
		<Table.Tr>
			<Table.Td>{index + 1}</Table.Td>

			<Table.Td>
				{`${record.payPeriod.name} (${dayjs(record.payPeriod.startDate).format(
					'MM/DD/YYYY',
				)} - ${dayjs(record.payPeriod.endDate).format('MM/DD/YYYY')})`}
			</Table.Td>

			<Table.Td ta="right">{record.totalHours.toFixed(2)}</Table.Td>

			<Table.Td ta="right">{formatMoney(record.hourlyRate)}</Table.Td>

			<Table.Td ta="right">{formatMoney(record.totalPay)}</Table.Td>

			<Table.Td ta="center">
				{record.payPeriod.status === 'PAID' ? 'Paid' : 'Pending'}
			</Table.Td>
		</Table.Tr>
	);
};
