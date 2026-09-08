import { Skeleton, Table } from '@mantine/core';

import stickyStyles from '@styles/sticky-table.module.css';

export const LoadingBody = () => {
	return (
		<>
			{Array.from({ length: 8 }).map((_, index) => (
				<Table.Tr key={index}>
					{Array.from({ length: 6 }).map((_, columnIndex) => (
						<Table.Td
							key={columnIndex}
							className={
								columnIndex === 0
									? stickyStyles.stickyLeft
									: columnIndex === 5
										? stickyStyles.stickyRight
										: undefined
							}
						>
							<Skeleton h={28} />
						</Table.Td>
					))}
				</Table.Tr>
			))}
		</>
	);
};
