'use client';

import { useSearchParams } from 'next/navigation';

import { Suspense, useEffect, useState } from 'react';

import { Text, Title } from '@mantine/core';

import { createClient } from '@helpers/supabase/client';

import { ErrorMessageBlock } from './components/ErrorMessageBlock';
import { FormBody } from './components/FormBody';
import { LoadingBlock } from './components/LoadingBlock';

const PageContent = () => {
	const searchParams = useSearchParams();

	const errorMessage = searchParams.get('error');
	const errorDescription = searchParams.get('error_description');

	const [isConfirmed, setIsConfirmed] = useState(false);

	useEffect(() => {
		if (isConfirmed) return;

		const supabase = createClient();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event) => {
			if (
				event === 'INITIAL_SESSION' ||
				event === 'PASSWORD_RECOVERY' ||
				event === 'SIGNED_IN'
			) {
				setIsConfirmed(true);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [isConfirmed]);

	if (errorMessage) {
		return <ErrorMessageBlock message={errorDescription || ''} />;
	}

	if (!isConfirmed) return <LoadingBlock />;

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
