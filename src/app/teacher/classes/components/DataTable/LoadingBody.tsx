import { Skeleton, Table } from '@mantine/core';

export const LoadingBody = () => {
	return (
		<>
			{Array.from({ length: 8 }).map((_, index) => (
				<Table.Tr key={index}>
					{Array.from({ length: 4 }).map((_, columnIndex) => (
						<Table.Td key={columnIndex}>
							<Skeleton h={28} />
						</Table.Td>
					))}
				</Table.Tr>
			))}
		</>
	);
};
