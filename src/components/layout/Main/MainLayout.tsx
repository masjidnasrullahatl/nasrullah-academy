'use client';

import { ReactNode } from 'react';

import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import HeaderNav from './components/Header';
import SidebarNav from './components/Sidebar';
import layoutClasses from './MainLayout.module.css';

type Props = {
	children: ReactNode;
};

export function MainLayout({ children }: Props) {
	const mobile_match = useMediaQuery('(max-width: 425px)');

	const shouldOverlay = mobile_match;

	return (
		<Box className={layoutClasses.layoutRoot}>
			<Box
				className={layoutClasses.sidebar}
				data-overlay={shouldOverlay}
				style={{
					width: 250,
					left: 0,
					zIndex: shouldOverlay ? 102 : 101,
				}}
			>
				<SidebarNav showCloseButton={false} onClose={() => {}} />
			</Box>

			<Box
				className={layoutClasses.main}
				data-overlay={shouldOverlay}
				ml={250}
				mih="100vh"
				pos="relative"
			>
				<Box className={layoutClasses.header} py="sm" px="lg" bg="white">
					<HeaderNav />
				</Box>
				<Box className={layoutClasses.content}>{children}</Box>
			</Box>
		</Box>
	);
}
