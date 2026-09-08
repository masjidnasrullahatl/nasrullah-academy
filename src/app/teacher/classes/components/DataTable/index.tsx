import { Alert, Paper, Table } from '@mantine/core';

import { IconAlertCircle } from '@tabler/icons-react';

import { useGetMyClasses } from '@hooks/react-query/teacher/useGetMyClasses';

import { EmptyBody } from './EmptyBody';
import { LoadingBody } from './LoadingBody';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export const DataTable = () => {
	const { data: classes, isLoading, isError, error } = useGetMyClasses();

	const rows = classes?.map((classItem, index) => (
		<TableRow key={classItem.id} classItem={classItem} index={index} />
	));

	const hasData = Boolean(classes?.length);

	return (
		<Paper p="md" withBorder>
			{isError && (
				<Alert color="red" mb="md" icon={<IconAlertCircle size={16} />}>
					{error.message}
				</Alert>
			)}

			<Table.ScrollContainer minWidth={600}>
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
