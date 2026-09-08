import { redirect } from 'next/navigation';

import { PATH_TEACHER_APPS } from '@configs/routes';

export default function TeacherPage() {
	redirect(PATH_TEACHER_APPS.timeEntries);
}
