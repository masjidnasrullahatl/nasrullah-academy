'use client';

import { ReactNode } from 'react';

import { Center, Stack } from '@mantine/core';

import Logo from '@components/Logo/Logo';

type AuthProps = {
	children: ReactNode;
};

function SignInLayout({ children }: AuthProps) {
	return (
		<Center
			style={{
				height: '100vh',
				width: '100vw',
			}}
		>
			<Stack>
				<Center>
					<Logo href="/" />
				</Center>
				{children}
			</Stack>
		</Center>
	);
}

export default SignInLayout;
