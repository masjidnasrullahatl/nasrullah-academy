'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense, useState } from 'react';

import { Alert, Button, Paper, Stack, Text, Title } from '@mantine/core';

import { IconAlertCircle, IconKey } from '@tabler/icons-react';

// Email links land here instead of signing in straight away. Email security
// scanners (Outlook Safe Links etc.) open every link in a message, which used
// up the one-time token before the teacher could click it. The token is only
// used when a person presses the button below.
const AcceptContent = () => {
	const searchParams = useSearchParams();
	const [isContinuing, setIsContinuing] = useState(false);

	const tokenHash = searchParams.get('token_hash');
	const type = searchParams.get('type') === 'invite' ? 'invite' : 'recovery';
	const next = searchParams.get('next') || '/auth/password-reset/confirm';

	if (!tokenHash) {
		return (
			<Alert
				icon={<IconAlertCircle size="1rem" />}
				title="Invalid link"
				color="red"
			>
				This link is incomplete. Ask the Academy office to send you a new one.
			</Alert>
		);
	}

	const handleContinue = () => {
		setIsContinuing(true);

		const params = new URLSearchParams({ token_hash: tokenHash, type, next });

		window.location.href = `/auth/confirm?${params}`;
	};

	return (
		<Paper withBorder p="xl" maw={440}>
			<Stack align="center" ta="center">
				<Title order={2} c="blue">
					{type === 'invite' ? 'Welcome to Nasrullah Academy' : 'Reset your password'}
				</Title>
				<Text c="dimmed">
					{type === 'invite'
						? 'Click below to create your password. You can then sign in and enter your work hours.'
						: 'Click below to choose a new password for your account.'}
				</Text>
				<Button
					size="md"
					leftSection={<IconKey size={18} />}
					loading={isContinuing}
					onClick={handleContinue}
				>
					{type === 'invite' ? 'Create my password' : 'Choose a new password'}
				</Button>
			</Stack>
		</Paper>
	);
};

export default function AcceptPage() {
	return (
		<Suspense>
			<title>Nasrullah Academy</title>
			<AcceptContent />
		</Suspense>
	);
}
