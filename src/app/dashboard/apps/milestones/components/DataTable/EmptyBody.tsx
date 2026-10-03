import { Center, Stack, Table, Text } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconTrophy } from '@tabler/icons-react';

export const EmptyBody = () => {
	return (
		<Table.Tr>
			<Table.Td className={stickyStyles.stickyLeft} />

			<Table.Td colSpan={6}>
				<Center h={260}>
					<Stack justify="center" align="center">
						<IconTrophy size={40} />
						<Text fw="semibold">No milestones recorded yet</Text>
					</Stack>
				</Center>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight} />
		</Table.Tr>
	);
};
