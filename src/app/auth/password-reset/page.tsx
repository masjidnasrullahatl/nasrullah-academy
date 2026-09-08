'use client';

import { Text, Title } from '@mantine/core';

import { FormBody } from './components/FormBody';

export default function Page() {
	return (
		<>
			<Title ta="center" c="blue">
				Forgot your password?
			</Title>
			<Text ta="center">Enter your email to get a reset link</Text>

			<FormBody />
		</>
	);
}
