'use client';

import { ActionIcon, Box, Group, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { IconPower, IconSearch } from '@tabler/icons-react';

import { useAuth } from '@hooks/useAuth';

const ICON_SIZE = 20;

const HeaderNav = () => {
	const mobile_match = useMediaQuery('(max-width: 425px)');
	const { logout } = useAuth();

	const getTextColor = () => {
		return undefined;
	};

	const textColor = getTextColor();

	return (
		<Group justify="space-between">
			<Box></Box>
			<Group>
				{mobile_match && (
					<ActionIcon>
						<IconSearch size={ICON_SIZE} color={textColor} />
					</ActionIcon>
				)}

				<Tooltip label="Logout">
					<ActionIcon onClick={logout} variant="default">
						<IconPower size={ICON_SIZE} color={textColor} />
					</ActionIcon>
				</Tooltip>
			</Group>
		</Group>
	);
};

export default HeaderNav;
