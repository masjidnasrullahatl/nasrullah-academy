import { redirect } from 'next/navigation';

import { PATH_DASHBOARD } from '@configs/routes';

export default function HomePage() {
	redirect(PATH_DASHBOARD.default);
}
