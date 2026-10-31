import { Alert, Stack, Text } from '@mantine/core';

import { IconHeartHandshake } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { useGetPagingScholarships } from '@hooks/react-query/scholarships/useScholarships';

import { formatMoney } from '@utils/money';
import { isScholarshipCurrent } from '@utils/scholarship';

// Who in this family has no fee due, and until when
export const ScholarshipNotice = ({ familyId }: { familyId: string }) => {
	const { data } = useGetPagingScholarships({ page: 1, limit: 50, familyId });

	const current = data?.data.filter((item) =>
		isScholarshipCurrent(item.startMonth, item.endMonth),
	);

	if (!current?.length) return null;

	return (
		<Alert
			color="grape"
			title="Scholarship"
			icon={<IconHeartHandshake size={16} />}
		>
			<Stack gap={4}>
				{current.map((item) => (
					<Text key={item.id} size="sm">
						{item.student.firstName} {item.student.lastName}: no fee due
						{item.endMonth
							? ` until ${dayjs(item.endMonth.slice(0, 10)).add(1, 'month').format('MMMM YYYY')}`
							: ''}
						. {formatMoney(item.amountReceived)} from{' '}
						{item.donorName || 'an anonymous donor'}.
					</Text>
				))}
			</Stack>
		</Alert>
	);
};
