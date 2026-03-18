import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  gardenName: string;
  weekStart: 'monday' | 'sunday';
  compactView: boolean;
  setGardenName: (name: string) => void;
  setWeekStart: (day: 'monday' | 'sunday') => void;
  toggleCompactView: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      gardenName: 'My Garden',
      weekStart: 'monday',
      compactView: false,
      setGardenName: (name) => set({ gardenName: name }),
      setWeekStart: (day) => set({ weekStart: day }),
      toggleCompactView: () => set((s) => ({ compactView: !s.compactView })),
    }),
    { name: 'garden-settings' }
  )
);
