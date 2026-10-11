/* eslint-disable no-unused-vars */
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { AppRole } from '@helpers/supabase/role';

export type AuthState = {
	isFetched: boolean;
	user: User | null;
	session: Session | null;
	role: AppRole;
};

export type AuthActions = {
	setUser: (user: User | null) => void;
	setSession: (session: Session | null) => void;
	setIsFetched: (isFetched: boolean) => void;
	setRole: (role: AppRole) => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
	user: null,
	session: null,
	role: 'none',
	isFetched: false,
	setUser: (user: User | null) => set({ user }),
	setSession: (session: Session | null) => set({ session }),
	setIsFetched: (isFetched: boolean) => set({ isFetched }),
	setRole: (role: AppRole) => set({ role }),
}));
