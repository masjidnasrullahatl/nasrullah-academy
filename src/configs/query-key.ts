export const QUERY_KEYS = {
	AUTH: { PROFILE: 'profile' },
	FAMILIES: { GET_PAGING: 'families.get-paging', GET_DETAIL: 'families.get-detail' },
	STUDENTS: { GET_PAGING: 'students.get-paging' },
	TEACHERS: { GET_PAGING: 'teachers.get-paging' },
	PROGRAMS: { GET_PAGING: 'programs.get-paging' },
	REGISTRATIONS: {
		GET_PAGING: 'registrations.get-paging',
		GET_DETAIL: 'registrations.get-detail',
	},
	MILESTONES: {
		GET_PAGING: 'milestones.get-paging',
		BOOKS: 'milestones.books',
	},
	CLASSES: {
		GET_PAGING: 'classes.get-paging',
		GET_AVAILABLE_STUDENTS: 'classes.get-available-students',
	},
	INVOICES: { GET_PAGING: 'invoices.get-paging', GET_DETAIL: 'invoices.get-detail' },
	DASHBOARD: { SUMMARY: 'dashboard.summary', YEARS: 'dashboard.years' },
	TEACHER: {
		MY_CLASSES: 'teacher.my-classes',
		MY_PAY_PERIODS: 'teacher.my-pay-periods',
		MY_TIMESHEET: 'teacher.my-timesheet',
		MY_PAY_RECORDS: 'teacher.my-pay-records',
		MY_PROFILE: 'teacher.my-profile',
	},
	PAY_PERIODS: {
		GET_PAGING: 'pay-periods.get-paging',
		GET_ONE: 'pay-periods.get-one',
		GET_TIMESHEETS: 'pay-periods.get-timesheets',
	},
	PAY_RECORDS: {
		GET_PAGING: 'pay-records.get-paging',
	},
};
