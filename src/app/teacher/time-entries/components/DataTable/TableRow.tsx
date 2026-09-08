/* eslint-disable no-unused-vars */
import { ActionIcon, Group, Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { MyTimeEntry } from '@hooks/react-query/teacher/useGetMyTimeEntries';

type Props = {
	entry: MyTimeEntry;
	index: number;
	canManage: boolean;
	busy: boolean;
	onEdit: (entry: MyTimeEntry) => void;
	onDelete: (entry: MyTimeEntry) => void;
};

export const TableRow = ({
	entry,
	index,
	canManage,
	busy,
	onEdit,
	onDelete,
}: Props) => {
	return (
		<Table.Tr>
			<Table.Td className={stickyStyles.stickyLeft}>{index + 1}</Table.Td>

			<Table.Td>{dayjs(entry.date).format('MM/DD/YYYY')}</Table.Td>

			<Table.Td>{entry.class.name}</Table.Td>

			<Table.Td>{entry.hours.toFixed(2)}</Table.Td>

			<Table.Td>{entry.notes || '-'}</Table.Td>

			<Table.Td ta="center" className={stickyStyles.stickyRight}>
				<Group justify="center" gap="xs" wrap="nowrap">
					<ActionIcon
						variant="subtle"
						onClick={() => onEdit(entry)}
						disabled={!canManage || busy}
					>
						<IconEdit size={16} />
					</ActionIcon>

					<ActionIcon
						variant="subtle"
						color="red"
						onClick={() => onDelete(entry)}
						disabled={!canManage || busy}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
};
