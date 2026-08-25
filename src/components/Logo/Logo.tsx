import Link from 'next/link';

import { Group, Text, ThemeIcon, UnstyledButton } from '@mantine/core';

import { IconBuildingMosque } from '@tabler/icons-react';

type LogoProps = {
	href?: string;
	showText?: boolean;
	className?: string;
};

const Logo = ({ href, showText = true, className }: LogoProps) => {
	return (
		<UnstyledButton className={className} component={Link} href={href || '/'}>
			<Group gap="xs" wrap="nowrap">
				<ThemeIcon size="lg" radius="xl" color="blue">
					<IconBuildingMosque size={18} />
				</ThemeIcon>

				{showText && (
					<Text fw={700} c="dark.8" truncate>
						Nasrullah Academy
					</Text>
				)}
			</Group>
		</UnstyledButton>
	);
};

export default Logo;
