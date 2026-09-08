'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Suspense, useEffect, useState } from 'react';

import { Alert, Button, Stack, Text, Title } from '@mantine/core';

import { IconAlertCircle } from '@tabler/icons-react';

import { PATH_AUTH } from '@configs/routes';

import { createClient } from '@helpers/supabase/client';

import { ErrorMessageBlock } from './components/ErrorMessageBlock';
import { FormBody } from './components/FormBody';
import { LoadingBlock } from './components/LoadingBlock';

const PageContent = () => {
	const searchParams = useSearchParams();

	const errorMessage = searchParams.get('error');
	const errorDescription = searchParams.get('error_description');

	const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>(
		'checking',
	);

	useEffect(() => {
		const supabase = createClient();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session) {
				setStatus('ready');
				return;
			}

			// INITIAL_SESSION mà không có session = link hỏng/hết hạn/sai trình duyệt
			if (event === 'INITIAL_SESSION') setStatus('invalid');
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	if (errorMessage) {
		return <ErrorMessageBlock message={errorDescription || ''} />;
	}

	if (status === 'checking') return <LoadingBlock />;

	if (status === 'invalid') {
		return (
			<Alert
				icon={<IconAlertCircle size="1rem" />}
				title="Invalid or expired link"
				color="red"
			>
				<Stack gap="sm">
					<Text fz="sm">
						This password link is invalid or has expired. Ask staff to send you
						a new one.
					</Text>
					<Button component={Link} href={PATH_AUTH.signin} variant="light">
						Back to sign in
					</Button>
				</Stack>
			</Alert>
		);
	}

	return (
		<>
			<Title ta="center" c="blue">
				Reset Your Password
			</Title>
			<Text ta="center">Enter your new password below</Text>

			<FormBody />
		</>
	);
};

export default function Page() {
	return (
		<Suspense fallback={<LoadingBlock />}>
			<PageContent />
		</Suspense>
	);
}
