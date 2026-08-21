import type {
	ArchiveStatus,
	ClassSession,
	EnrollmentStatus,
	Gender,
	PaymentStatus,
	PayMethod,
	ProgramCode,
	RecordStatus,
} from '@prisma/client';

type SelectOption = {
	value: string;
	label: string;
};

export const PROGRAM_CODE_LABELS: Record<ProgramCode, string> = {
	HIFZ: 'Hifz',
	WEEKEND: 'Weekend',
};

export const PROGRAM_CODE_OPTIONS: SelectOption[] = [
	{ value: 'HIFZ', label: PROGRAM_CODE_LABELS.HIFZ },
	{ value: 'WEEKEND', label: PROGRAM_CODE_LABELS.WEEKEND },
];

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
	ACTIVE: 'Active',
	INACTIVE: 'Inactive',
};

export const RECORD_STATUS_COLORS: Record<RecordStatus, string> = {
	ACTIVE: 'green',
	INACTIVE: 'gray',
};

export const RECORD_STATUS_OPTIONS: SelectOption[] = [
	{ value: 'ACTIVE', label: RECORD_STATUS_LABELS.ACTIVE },
	{ value: 'INACTIVE', label: RECORD_STATUS_LABELS.INACTIVE },
];

export const ARCHIVE_STATUS_LABELS: Record<ArchiveStatus, string> = {
	ACTIVE: 'Active',
	ARCHIVED: 'Archived',
};

export const ARCHIVE_STATUS_COLORS: Record<ArchiveStatus, string> = {
	ACTIVE: 'green',
	ARCHIVED: 'gray',
};

export const ARCHIVE_STATUS_OPTIONS: SelectOption[] = [
	{ value: 'ACTIVE', label: ARCHIVE_STATUS_LABELS.ACTIVE },
	{ value: 'ARCHIVED', label: ARCHIVE_STATUS_LABELS.ARCHIVED },
];

export const GENDER_LABELS: Record<Gender, string> = {
	BOY: 'Boy',
	GIRL: 'Girl',
};

export const GENDER_OPTIONS: SelectOption[] = [
	{ value: 'BOY', label: GENDER_LABELS.BOY },
	{ value: 'GIRL', label: GENDER_LABELS.GIRL },
];

export const CLASS_SESSION_LABELS: Record<ClassSession, string> = {
	AM: 'AM',
	PM: 'PM',
	AM_PM: 'AM/PM',
	NA: 'N/A',
};

export const CLASS_SESSION_OPTIONS: SelectOption[] = [
	{ value: 'AM', label: CLASS_SESSION_LABELS.AM },
	{ value: 'PM', label: CLASS_SESSION_LABELS.PM },
	{ value: 'AM_PM', label: CLASS_SESSION_LABELS.AM_PM },
	{ value: 'NA', label: CLASS_SESSION_LABELS.NA },
];

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
	ACTIVE: 'Active',
	WITHDRAWN: 'Withdrawn',
	COMPLETED: 'Completed',
};

export const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, string> = {
	ACTIVE: 'green',
	WITHDRAWN: 'red',
	COMPLETED: 'blue',
};

export const ENROLLMENT_STATUS_OPTIONS: SelectOption[] = [
	{ value: 'ACTIVE', label: ENROLLMENT_STATUS_LABELS.ACTIVE },
	{ value: 'WITHDRAWN', label: ENROLLMENT_STATUS_LABELS.WITHDRAWN },
	{ value: 'COMPLETED', label: ENROLLMENT_STATUS_LABELS.COMPLETED },
];

export const PAY_METHOD_LABELS: Record<PayMethod, string> = {
	KEELA: 'Keela',
	ZELLE: 'Zelle',
	CASH: 'Cash',
	CASHAPP: 'Cash App',
	CHECK: 'Check',
	FREE: 'Free',
	OTHER: 'Other',
	NA: 'N/A',
};

export const PAY_METHOD_OPTIONS: SelectOption[] = [
	{ value: 'KEELA', label: PAY_METHOD_LABELS.KEELA },
	{ value: 'ZELLE', label: PAY_METHOD_LABELS.ZELLE },
	{ value: 'CASH', label: PAY_METHOD_LABELS.CASH },
	{ value: 'CASHAPP', label: PAY_METHOD_LABELS.CASHAPP },
	{ value: 'CHECK', label: PAY_METHOD_LABELS.CHECK },
	{ value: 'FREE', label: PAY_METHOD_LABELS.FREE },
	{ value: 'OTHER', label: PAY_METHOD_LABELS.OTHER },
	{ value: 'NA', label: PAY_METHOD_LABELS.NA },
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
	PAID: 'Paid',
	PARTIAL: 'Partial',
	UNPAID: 'Unpaid',
	NA: 'N/A',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
	PAID: 'green',
	PARTIAL: 'yellow',
	UNPAID: 'red',
	NA: 'gray',
};

export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
	{ value: 'PAID', label: PAYMENT_STATUS_LABELS.PAID },
	{ value: 'PARTIAL', label: PAYMENT_STATUS_LABELS.PARTIAL },
	{ value: 'UNPAID', label: PAYMENT_STATUS_LABELS.UNPAID },
	{ value: 'NA', label: PAYMENT_STATUS_LABELS.NA },
];

export const MONTH_OPTIONS: SelectOption[] = [
	{ value: '1', label: 'January' },
	{ value: '2', label: 'February' },
	{ value: '3', label: 'March' },
	{ value: '4', label: 'April' },
	{ value: '5', label: 'May' },
	{ value: '6', label: 'June' },
	{ value: '7', label: 'July' },
	{ value: '8', label: 'August' },
	{ value: '9', label: 'September' },
	{ value: '10', label: 'October' },
	{ value: '11', label: 'November' },
	{ value: '12', label: 'December' },
];
