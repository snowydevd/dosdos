import { create } from 'zustand';
import type { Duo } from '@/types';

interface DuoState {
  // El dúo activo del usuario. null = no tiene dúo todavía.
  miDuo: Duo | null;
  setMiDuo: (duo: Duo | null) => void;

  // Índice actual en el deck de swipe (se resetea cuando se actualiza el feed)
  swipeIndex: number;
  incrementarSwipeIndex: () => void;
  resetSwipeIndex: () => void;

  // Cuando ocurre un match, guardamos el matchId para mostrar la animación
  matchReciente: string | null;
  setMatchReciente: (matchId: string | null) => void;
}

export const useDuoStore = create<DuoState>((set) => ({
  miDuo: null,
  setMiDuo: (miDuo) => set({ miDuo }),

  swipeIndex: 0,
  incrementarSwipeIndex: () => set((s) => ({ swipeIndex: s.swipeIndex + 1 })),
  resetSwipeIndex: () => set({ swipeIndex: 0 }),

  matchReciente: null,
  setMatchReciente: (matchReciente) => set({ matchReciente }),
}));
