'use client';

import { ReactNode } from 'react';

import {
	Breadcrumbs,
	Divider,
	Flex,
	rem,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';

import Surface from '@components/Surface';

import { useAuth } from '@/hooks/useAuth';

type PageHeaderProps = {
	title: string;
	withActions?: boolean;
	breadcrumbItems?: any;
	actionButton?: ReactNode;
	actionContent?: ReactNode;
};

const PageHeader = (props: PageHeaderProps) => {
	const {
		withActions,
		breadcrumbItems,
		title,
		actionButton,
		actionContent,
		...others
	} = props;
	const { user } = useAuth();

	const theme = useMantineTheme();
	const colorScheme = useColorScheme();

	const BREADCRUMBS_PROPS: Omit<any, 'children'> = {
		style: {
			a: {
				padding: rem(8),
				borderRadius: theme.radius.sm,
				fontWeight: 500,
				color: colorScheme === 'dark' ? theme.white : theme.black,

				'&:hover': {
					transition: 'all ease 150ms',
					backgroundColor:
						colorScheme === 'dark'
							? theme.colors.dark[5]
							: theme.colors.gray[2],
					textDecoration: 'none',
				},
			},
		},
	};

	const renderActions = () => {
		// Custom action content takes precedence
		if (actionContent) {
			return actionContent;
		}

		// Custom action button
		if (actionButton) {
			return actionButton;
		}

		return null;
	};

	return (
		<>
			<Surface {...others}>
				{withActions ? (
					<Flex
						justify="space-between"
						direction={{ base: 'column', sm: 'row' }}
						gap={{ base: 'sm', sm: 4 }}
					>
						<Stack gap={4}>
							<Title order={3}>{title}</Title>
							<Text>Welcome back, {user?.user_metadata.full_name}!</Text>
						</Stack>
						{renderActions()}
					</Flex>
				) : (
					<Flex
						align="center"
						justify="space-between"
						direction={{ base: 'row', sm: 'row' }}
						gap={{ base: 'sm', sm: 4 }}
					>
						<Stack>
							<Title order={3}>{title}</Title>
							{breadcrumbItems && (
								<Breadcrumbs {...BREADCRUMBS_PROPS}>
									{breadcrumbItems}
								</Breadcrumbs>
							)}
						</Stack>
						{renderActions()}
					</Flex>
				)}
			</Surface>
			<Divider />
		</>
	);
};

export default PageHeader;
