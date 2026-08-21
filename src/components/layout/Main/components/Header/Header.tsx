'use client';

import { Burger, Group } from '@mantine/core';

type HeaderNavProps = {
	showSidebarToggle?: boolean;
	onToggleSidebar?: () => void;
};

const HeaderNav = ({ showSidebarToggle = false, onToggleSidebar }: HeaderNavProps) => {
	return (
		<Group justify="space-between">
			<Group>
				{showSidebarToggle && <Burger opened={false} onClick={onToggleSidebar} aria-label="Toggle sidebar" />}
			</Group>
			<div />
		</Group>
	);
};

export default HeaderNav;
