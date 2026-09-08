import { Alert, Paper, Table } from '@mantine/core';

import { IconAlertCircle } from '@tabler/icons-react';

import { useGetMyPayRecords } from '@hooks/react-query/teacher/useGetMyPayRecords';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export const DataTable = () => {
	const { data: records, isLoading, isError, error } = useGetMyPayRecords();

	const rows = records?.map((record, index) => (
		<TableRow key={record.id} record={record} index={index} />
	));

	const hasData = Boolean(records?.length);

	return (
		<Paper p="md" withBorder>
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Table.ScrollContainer minWidth={700}>
				<Table
					striped="even"
					highlightOnHover
					withTableBorder
					withColumnBorders
					verticalSpacing="sm"
					horizontalSpacing="md"
				>
					<TableHeader />

					<Table.Tbody>
						{isLoading ? <LoadingBody /> : hasData ? rows : <EmptyBody />}
					</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
		</Paper>
	);
};
