function path(root: string, sublink: string) {
	return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = '/dashboard';
const ROOTS_AUTH = '/auth';

const ROOT_APPS = path(ROOTS_DASHBOARD, '/apps');
const ROOT_FINANCE = path(ROOTS_DASHBOARD, '/finance');
const ROOT_SETTINGS = path(ROOTS_DASHBOARD, '/settings');
const ROOTS_ACCOUNTS = path(ROOTS_DASHBOARD, '/accounts');

export const PATH_DASHBOARD = {
	root: ROOTS_DASHBOARD,
	default: path(ROOTS_DASHBOARD, ''),
};

export const PATH_APPS = {
	root: ROOT_APPS,
	families: path(ROOT_APPS, '/families'),
	students: path(ROOT_APPS, '/students'),
	classes: path(ROOT_APPS, '/classes'),
	teachers: path(ROOT_APPS, '/teachers'),
};

export const PATH_FINANCE = {
	root: ROOT_FINANCE,
	payments: path(ROOT_FINANCE, '/payments'),
};

export const PATH_SETTINGS = {
	root: ROOT_SETTINGS,
	programs: path(ROOT_SETTINGS, '/programs'),
};

export const PATH_ACCOUNTS = {
	root: ROOTS_ACCOUNTS,
	profile: path(ROOTS_ACCOUNTS, '/profile'),
	changePassword: path(ROOTS_ACCOUNTS, '/change-password'),
};

export const PATH_AUTH = {
	root: ROOTS_AUTH,
	signin: path(ROOTS_AUTH, '/signin'),
	passwordReset: path(ROOTS_AUTH, '/password-reset'),
};
