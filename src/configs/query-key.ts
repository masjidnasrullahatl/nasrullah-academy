export const QUERY_KEYS = {
	AUTH: { PROFILE: 'profile' },
	FAMILIES: { GET_PAGING: 'families.get-paging', GET_DETAIL: 'families.get-detail' },
	STUDENTS: { GET_PAGING: 'students.get-paging' },
	TEACHERS: { GET_PAGING: 'teachers.get-paging' },
	PROGRAMS: { GET_PAGING: 'programs.get-paging' },
	CLASSES: {
		GET_PAGING: 'classes.get-paging',
		GET_AVAILABLE_STUDENTS: 'classes.get-available-students',
	},
	INVOICES: { GET_PAGING: 'invoices.get-paging', GET_DETAIL: 'invoices.get-detail' },
	DASHBOARD: { SUMMARY: 'dashboard.summary', YEARS: 'dashboard.years' },
	TEACHER: {
		MY_CLASSES: 'teacher.my-classes',
		MY_TIME_ENTRIES: 'teacher.my-time-entries',
		MY_PAY_RECORDS: 'teacher.my-pay-records',
		MY_PROFILE: 'teacher.my-profile',
	},
	PAY_PERIODS: {
		GET_PAGING: 'pay-periods.get-paging',
		GET_ONE: 'pay-periods.get-one',
		GET_SUBMISSIONS: 'pay-periods.get-submissions',
	},
	TIME_ENTRIES: {
		GET_PAGING: 'time-entries.get-paging',
	},
	PAY_RECORDS: {
		GET_PAGING: 'pay-records.get-paging',
	},
};
