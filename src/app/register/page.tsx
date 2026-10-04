'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';

import { Button, Card, Group, Loader, Stack, Text, Title } from '@mantine/core';

import { IconArrowRight } from '@tabler/icons-react';

type OpenProgram = { name: string; slug: string };

export default function RegisterIndexPage() {
	const [programs, setPrograms] = useState<OpenProgram[] | null>(null);

	useEffect(() => {
		fetch('/api/public/programs')
			.then((response) => response.json())
			.then((result) => setPrograms(result.data || []))
			.catch(() => setPrograms([]));
	}, []);

	return (
		<Stack>
			<title>Register | Nasrullah Academy</title>
			<Title order={2}>Student Registration</Title>
			<Text c="dimmed">Choose the program you would like to register for.</Text>

			{programs === null ? (
				<Loader />
			) : programs.length === 0 ? (
				<Text>Registration is currently closed. Please contact the masjid.</Text>
			) : (
				programs.map((program) => (
					<Card key={program.slug} withBorder padding="lg">
						<Group justify="space-between">
							<Text fw={600} size="lg">
								{program.name}
							</Text>
							<Button
								component={Link}
								href={`/register/${program.slug}`}
								rightSection={<IconArrowRight size={16} />}
							>
								Register
							</Button>
						</Group>
					</Card>
				))
			)}
		</Stack>
	);
}
