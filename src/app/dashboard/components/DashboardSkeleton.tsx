import { Center, Paper, SimpleGrid, Skeleton, Stack } from '@mantine/core';

import Surface from '@components/Surface';

export const DashboardSkeleton = () => {
	return (
		<Stack>
			<SimpleGrid cols={{ base: 2, md: 3 }}>
				{Array.from({ length: 6 }).map((_, index) => (
					<Surface key={index} feel="bordered">
						<Skeleton h={32} w={32} radius="sm" />
						<Skeleton h={12} w="55%" mt="sm" />
						<Skeleton h={24} w="40%" mt="xs" />
					</Surface>
				))}
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, lg: 3 }}>
				<Paper p="md" withBorder>
					<Skeleton h={18} w={160} mb="md" />
					<Skeleton h={320} />
				</Paper>
				{Array.from({ length: 2 }).map((_, index) => (
					<Paper key={index} p="md" withBorder>
						<Skeleton h={18} w={140} mb="md" />
						<Center>
							<Skeleton h={200} w={200} circle />
						</Center>
					</Paper>
				))}
			</SimpleGrid>

			{Array.from({ length: 4 }).map((_, index) => (
				<Paper key={index} p="md" withBorder>
					<Skeleton h={18} w={180} mb="md" />
					{Array.from({ length: 6 }).map((__, rowIndex) => (
						<Skeleton key={rowIndex} h={28} mb="xs" />
					))}
				</Paper>
			))}
		</Stack>
	);
};
