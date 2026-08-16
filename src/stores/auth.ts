/* eslint-disable no-unused-vars */
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

export type AuthState = {
	isFetched: boolean;
	user: User | null;
	session: Session | null;
};

export type AuthActions = {
	setUser: (user: User | null) => void;
	setSession: (session: Session | null) => void;
	setIsFetched: (isFetched: boolean) => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
	user: null,
	session: null,
	isFetched: false,
	setUser: (user: User | null) => set({ user }),
	setSession: (session: Session | null) => set({ session }),
	setIsFetched: (isFetched: boolean) => set({ isFetched }),
}));
