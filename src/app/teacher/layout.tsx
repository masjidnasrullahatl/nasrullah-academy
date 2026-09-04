'use client';

import { ReactNode } from 'react';

import { MainLayout } from '@components/layout/Main';

import { TEACHER_SIDEBAR_LINKS } from '@configs/teacher-sidebar-links';

type TeacherLayoutProps = {
	children: ReactNode;
};

export default function TeacherLayout({ children }: TeacherLayoutProps) {
	return <MainLayout sidebarLinks={TEACHER_SIDEBAR_LINKS}>{children}</MainLayout>;
}
