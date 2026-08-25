'use client';

import { ReactNode, useEffect } from 'react';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from '@components/auth/AuthProvider';

import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

const queryClient = new QueryClient();

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	useEffect(() => {
		const root = document.documentElement;

		// Set primary color CSS variables
		const primaryColor = '#2f9e44';
		root.style.setProperty('--theme-primary-color', primaryColor);

		// Set border radius
		const radiusMap = {
			xs: '0.125rem',
			sm: '0.25rem',
			md: '0.5rem',
			lg: '0.75rem',
			xl: '1rem',
		};
		root.style.setProperty('--theme-border-radius', radiusMap['sm']);

		// Set spacing scale for compact mode
		const spacingScale = '1';
		root.style.setProperty('--theme-spacing-scale', spacingScale);

		// Set compact mode flag
		root.style.setProperty('--theme-compact', '1');

		// Additional CSS variables for layout
		root.style.setProperty('--sidebar-width', `${300}px`);
		root.style.setProperty('--header-height', `${60}px`);
	}, []);

	return (
		<html lang="en">
			<head>
				<title>Nasrullah Academy</title>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width"
				/>
				<meta
					name="description"
					content="Nasrullah Academy management portal"
				/>

				<ColorSchemeScript defaultColorScheme="light" />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<MantineProvider
							defaultColorScheme="light"
							theme={{
								components: {
									Modal: {
										styles: {
											header: {
												borderBottom: '1px solid var(--mantine-color-gray-3)',
												marginBottom: 'var(--mantine-spacing-md)',
											},
											title: {
												fontWeight: 600,
											},
										},
									},
								},
							}}
						>
							<DatesProvider
								settings={{
									firstDayOfWeek: 0,
									weekendDays: [0],
								}}
							>
								<Notifications position="bottom-right" zIndex={1000} />
								<ModalsProvider>{children}</ModalsProvider>
							</DatesProvider>
						</MantineProvider>
					</AuthProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</body>
		</html>
	);
}
