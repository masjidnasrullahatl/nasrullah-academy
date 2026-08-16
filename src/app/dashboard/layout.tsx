import { ReactNode } from 'react';

import { MainLayout } from '@components/layout/Main';

type DashboardLayoutProps = {
	children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return <MainLayout>{children}</MainLayout>;
}
