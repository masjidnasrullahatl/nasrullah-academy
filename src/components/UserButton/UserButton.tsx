import { ReactNode } from 'react';

import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';

import { IconChevronRight, IconLogout } from '@tabler/icons-react';

import { useGetProfile } from '@hooks/react-query/auth/useGetProfile';
import { useAuth } from '@hooks/useAuth';

import classes from './UserButton.module.css';

type UserProfileButtonProps = {
	image?: string;
	name?: string;
	email?: string;
	icon?: ReactNode;
	asAction?: boolean;
	showText?: boolean;
};

const UserProfileButton = ({
	image,
	name,
	email,
	icon,
	asAction,
	showText = true,
	...others
}: UserProfileButtonProps) => {
	const { data: profile } = useGetProfile();
	const { logout, user } = useAuth();

	const profileName = profile?.fullName || name || user?.user_metadata.full_name || '';
	const profileEmail = profile?.email || email || user?.email || '';
	const displayName = profileName || 'Staff User';
	const avatarInitial = (profileName || profileEmail).charAt(0).toUpperCase();
	const shouldShowEmailLine = profileEmail && displayName !== profileEmail;
	const avatarImage = image || user?.user_metadata.avatar_url || '';

	return (
		<Menu width={260} position="top-start" shadow="md">
			<Menu.Target>
				<UnstyledButton className={classes.user} p={0} {...others}>
					<Group wrap="nowrap">
						<Avatar src={avatarImage} radius="xl">
							{avatarInitial}
						</Avatar>

						{showText && (
							<div style={{ flex: 1 }}>
								<Text size="sm" fw="bold" c="blue.5">
									{displayName}
								</Text>

								{shouldShowEmailLine && <Text size="xs">{profileEmail}</Text>}
							</div>
						)}

						{(icon || asAction) && (
							<IconChevronRight size="0.9rem" stroke={1.5} />
						)}
					</Group>
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>{displayName}</Menu.Label>
				{shouldShowEmailLine && <Menu.Item disabled>{profileEmail}</Menu.Item>}
				<Menu.Divider />
				<Menu.Item leftSection={<IconLogout size={16} />} onClick={logout}>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default UserProfileButton;
