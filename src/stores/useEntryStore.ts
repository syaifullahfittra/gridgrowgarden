import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entry } from '@/lib/types';

interface EntryStore {
  entries: Entry[];
  addEntry: (entry: Entry) => void;
  removeEntry: (id: string) => void;
  getEntriesForPlot: (plotId: string) => Entry[];
  getEntryForDate: (plotId: string, date: string) => Entry | undefined;
}

export const useEntryStore = create<EntryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      getEntriesForPlot: (plotId) => get().entries.filter((e) => e.plot_id === plotId),
      getEntryForDate: (plotId, date) =>
        get().entries.find((e) => e.plot_id === plotId && e.date === date),
    }),
    { name: 'garden-entries' }
  )
);
