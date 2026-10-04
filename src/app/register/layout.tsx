'use client';

import { ReactNode } from 'react';

import { Box, Container, Group, Text } from '@mantine/core';

import Logo from '@components/Logo/Logo';

export default function RegisterLayout({ children }: { children: ReactNode }) {
	return (
		<Box bg="gray.0" mih="100vh">
			<Box bg="white" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
				<Container size="md">
					<Group justify="space-between">
						<Logo href="/register" />
						<Text size="sm" c="dimmed">
							Masjid Nasrullah · Lawrenceville, GA
						</Text>
					</Group>
				</Container>
			</Box>

			<Container size="md" py="xl">
				{children}
			</Container>
		</Box>
	);
}
