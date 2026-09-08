import { Center, Stack, Table, Text } from '@mantine/core';

import { IconBox } from '@tabler/icons-react';

export const EmptyBody = () => {
	return (
		<Table.Tr>
			<Table.Td colSpan={4}>
				<Center h={220}>
					<Stack align="center">
						<IconBox size={40} />
						<Text fw={600}>No classes found</Text>
					</Stack>
				</Center>
			</Table.Td>
		</Table.Tr>
	);
};
