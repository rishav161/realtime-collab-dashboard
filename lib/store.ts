import { create } from 'zustand';

// Simple app state for counter and other non-collab features
interface AppState {
  count: number;
  setCount: (count: number) => void;
}

export const useStore = create<AppState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));
