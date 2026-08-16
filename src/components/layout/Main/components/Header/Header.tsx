'use client';

import { ActionIcon, Box, Group, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { IconSearch } from '@tabler/icons-react';

const ICON_SIZE = 20;

const HeaderNav = () => {
	const mobile_match = useMediaQuery('(max-width: 425px)');

	const getTextColor = () => {
		return undefined;
	};

	const textColor = getTextColor();

	return (
		<Group justify="space-between">
			<Box></Box>
			<Group>
				{mobile_match && (
					<Tooltip label="Search">
						<ActionIcon>
							<IconSearch size={ICON_SIZE} color={textColor} />
						</ActionIcon>
					</Tooltip>
				)}
			</Group>
		</Group>
	);
};

export default HeaderNav;
