import {
	IconCash,
	IconClock,
	IconKey,
	IconSchool,
	IconUserCode,
} from '@tabler/icons-react';

import { PATH_TEACHER_ACCOUNTS, PATH_TEACHER_APPS } from './routes';

export const TEACHER_SIDEBAR_LINKS = [
	{
		title: 'Teaching',
		links: [
			{
				label: 'My Classes',
				icon: IconSchool,
				link: PATH_TEACHER_APPS.classes,
			},
			{
				label: 'Time Entry',
				icon: IconClock,
				link: PATH_TEACHER_APPS.timeEntries,
			},
			{
				label: 'My Pay',
				icon: IconCash,
				link: PATH_TEACHER_APPS.pay,
			},
		],
	},
	{
		title: 'Account',
		links: [
			{
				label: 'Profile',
				icon: IconUserCode,
				link: PATH_TEACHER_ACCOUNTS.profile,
			},
			{
				label: 'Change Password',
				icon: IconKey,
				link: PATH_TEACHER_ACCOUNTS.changePassword,
			},
		],
	},
];
