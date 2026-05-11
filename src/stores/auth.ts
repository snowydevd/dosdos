import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  perfil: User | null;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setPerfil: (perfil: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  supabaseUser: null,
  perfil: null,
  isLoading: true,

  setSession: (session) => set({ session }),
  setSupabaseUser: (supabaseUser) => set({ supabaseUser }),
  setPerfil: (perfil) => set({ perfil }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ session: null, supabaseUser: null, perfil: null }),
}));
