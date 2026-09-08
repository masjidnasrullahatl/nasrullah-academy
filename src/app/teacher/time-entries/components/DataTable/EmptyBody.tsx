import { Center, Stack, Table, Text } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';
import { IconBox } from '@tabler/icons-react';

export const EmptyBody = () => {
	return (
		<Table.Tr>
			<Table.Td className={stickyStyles.stickyLeft} />

			<Table.Td colSpan={4}>
				<Center h={220}>
					<Stack align="center">
						<IconBox size={40} />
						<Text fw={600}>No time entries found for this pay period</Text>
					</Stack>
				</Center>
			</Table.Td>

			<Table.Td className={stickyStyles.stickyRight} />
		</Table.Tr>
	);
};
