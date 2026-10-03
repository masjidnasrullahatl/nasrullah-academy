'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

import { Alert, Button, Card, Stack, Text, ThemeIcon, Title } from '@mantine/core';

import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';

const ThanksContent = () => {
	const { slug } = useParams<{ slug: string }>();
	const paid = useSearchParams().get('paid');

	return (
		<Card withBorder padding="xl">
			<Stack align="center" ta="center">
				<title>Registration received | Nasrullah Academy</title>
				<ThemeIcon size={64} radius="xl" color="green">
					<IconCircleCheck size={40} />
				</ThemeIcon>
				<Title order={2}>JazakAllahu khairan!</Title>
				<Text>Your registration has been received.</Text>

				{paid === '1' && (
					<Text c="green.8" fw={600}>
						Your card payment was successful. Monthly tuition will be charged
						automatically.
					</Text>
				)}

				{paid === '0' && (
					<Alert color="yellow" icon={<IconAlertCircle size={16} />} ta="left">
						The card payment was not completed. Your registration is still
						saved; the Academy office will contact you about payment.
					</Alert>
				)}

				{paid !== '1' && paid !== '0' && (
					<Text c="dimmed">
						The Academy office will review your registration and contact you
						about payment and your child&apos;s start date.
					</Text>
				)}

				<Text size="sm" c="dimmed">
					Questions? Call 470-253-9391 or email info@masjidnasrullah.org
				</Text>

				<Button variant="light" component={Link} href={`/register/${slug}`}>
					Register another family
				</Button>
			</Stack>
		</Card>
	);
};

export default function RegistrationThanksPage() {
	return (
		<Suspense>
			<ThanksContent />
		</Suspense>
	);
}
