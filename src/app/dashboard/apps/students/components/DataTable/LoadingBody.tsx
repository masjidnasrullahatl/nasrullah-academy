import { Skeleton, Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const LoadingBody = () => {
	return (
		<>
			{Array.from({ length: 10 }).map((_, index) => (
				<Table.Tr key={index}>
					{Array.from({ length: 8 }).map((_, columnIndex) => (
						<Table.Td
							key={columnIndex}
							className={
								columnIndex === 0
									? stickyStyles.stickyLeft
									: columnIndex === 7
										? stickyStyles.stickyRight
										: undefined
							}
						>
							<Skeleton h={30} w="100%" />
						</Table.Td>
					))}
				</Table.Tr>
			))}
		</>
	);
};
