import {
	IconCalendarDollar,
	IconCategory,
	IconChalkboard,
	IconClipboardList,
	IconKey,
	IconLayoutDashboard,
	IconReceipt,
	IconSchool,
	IconTrophy,
	IconUser,
	IconUserCode,
	IconUsersGroup,
} from '@tabler/icons-react';

import {
	PATH_ACCOUNTS,
	PATH_APPS,
	PATH_DASHBOARD,
	PATH_FINANCE,
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
				label: 'Programs',
				icon: IconCategory,
				link: PATH_APPS.programs,
			},
			{
				label: 'Classes',
				icon: IconSchool,
				link: PATH_APPS.classes,
			},
			{
				label: 'Registrations',
				icon: IconClipboardList,
				link: PATH_APPS.registrations,
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
				label: 'Milestones',
				icon: IconTrophy,
				link: PATH_APPS.milestones,
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
