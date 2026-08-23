'use client';

import { ReactNode, useState } from 'react';

import { Box, Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import HeaderNav from './components/Header';
import SidebarNav from './components/Sidebar';
import layoutClasses from './MainLayout.module.css';

type Props = {
	children: ReactNode;
};

export function MainLayout({ children }: Props) {
	const [openedSidebar, setOpenedSidebar] = useState(false);
	const isMobile = useMediaQuery('(max-width: 768px)');

	return (
		<Box className={layoutClasses.layoutRoot}>
			{!isMobile && (
				<Box
					className={layoutClasses.sidebar}
					style={{
						width: 250,
						left: 0,
						zIndex: 101,
					}}
				>
					<SidebarNav showCloseButton={false} onClose={() => {}} />
				</Box>
			)}

			<Drawer
				opened={Boolean(isMobile && openedSidebar)}
				onClose={() => setOpenedSidebar(false)}
				withCloseButton={false}
				padding={0}
				size={250}
				styles={{ body: { height: '100%', padding: 0 } }}
			>
				<SidebarNav
					showCloseButton={true}
					onClose={() => setOpenedSidebar(false)}
				/>
			</Drawer>

			<Box
				className={layoutClasses.main}
				ml={isMobile ? 0 : 250}
				mih="100vh"
				pos="relative"
			>
				<Box
					className={layoutClasses.header}
					py={{ base: 'xs', md: 0 }}
					px="lg"
					bg="white"
				>
					<HeaderNav
						showSidebarToggle={Boolean(isMobile)}
						onToggleSidebar={() => setOpenedSidebar((prev) => !prev)}
					/>
				</Box>
				<Box className={layoutClasses.content}>{children}</Box>
			</Box>
		</Box>
	);
}
