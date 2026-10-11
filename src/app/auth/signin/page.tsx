'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

import { Alert, Text, Title } from '@mantine/core';

import { IconAlertCircle } from '@tabler/icons-react';

import { FormBody } from './components/FormBody';

const NoAccessMessage = () => {
	const error = useSearchParams().get('error');

	if (error !== 'no_access') return null;

	return (
		<Alert color="red" icon={<IconAlertCircle size={16} />} maw={420}>
			This account has not been given access to the Nasrullah Academy portal.
			Please contact the Academy office.
		</Alert>
	);
};

export default function Page() {
	return (
		<>
			<Title ta="center" c="blue">
				Sign In
			</Title>
			<Text ta="center">Sign in to your account to continue</Text>

			<Suspense>
				<NoAccessMessage />
			</Suspense>

			<FormBody />
		</>
	);
}
