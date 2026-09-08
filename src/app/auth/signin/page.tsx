'use client';

import { Text, Title } from '@mantine/core';

import { FormBody } from './components/FormBody';

export default function Page() {
	return (
		<>
			<Title ta="center" c="blue">
				Sign In
			</Title>
			<Text ta="center">Sign in to your account to continue</Text>

			<FormBody />
		</>
	);
}
