import {
	IconCalendarDollar,
	IconCategory,
	IconChalkboard,
	IconKey,
	IconLayoutDashboard,
	IconReceipt,
	IconSchool,
	IconUser,
	IconUserCode,
	IconUsersGroup,
} from '@tabler/icons-react';

import {
	PATH_ACCOUNTS,
	PATH_APPS,
	PATH_DASHBOARD,
	PATH_FINANCE,
	PATH_SETTINGS,
} from './routes';

export const SIDEBAR_LINKS = [
	{
		title: 'Overview',
		links: [
			{
				label: 'Dashboard',
				icon: IconLayoutDashboard,
				link: PATH_DASHBOARD.default,
			},
		],
	},
	{
		title: 'School',
		links: [
			{
				label: 'Classes',
				icon: IconSchool,
				link: PATH_APPS.classes,
			},
			{
				label: 'Families',
				icon: IconUsersGroup,
				link: PATH_APPS.families,
			},
			{
				label: 'Students',
				icon: IconUser,
				link: PATH_APPS.students,
			},
			{
				label: 'Teachers',
				icon: IconChalkboard,
				link: PATH_APPS.teachers,
			},
		],
	},
	{
		title: 'Finance',
		links: [
			{
				label: 'Monthly Payments',
				icon: IconReceipt,
				link: PATH_FINANCE.payments,
			},
			{
				label: 'Pay Periods',
				icon: IconCalendarDollar,
				link: PATH_FINANCE.payPeriods,
			},
		],
	},
	{
		title: 'Settings',
		links: [
			{
				label: 'Programs',
				icon: IconCategory,
				link: PATH_SETTINGS.programs,
			},
		],
	},
	{
		title: 'Account',
		links: [
			{
				label: 'Profile',
				icon: IconUserCode,
				link: PATH_ACCOUNTS.profile,
			},
			{
				label: 'Change Password',
				icon: IconKey,
				link: PATH_ACCOUNTS.changePassword,
			},
		],
	},
];
