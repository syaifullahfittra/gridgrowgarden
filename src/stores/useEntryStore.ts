import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Entry } from '@/lib/types';
import { pushEntry, pushDeleteEntry } from '@/hooks/useSyncManager';
import { supabase } from '@/integrations/supabase/client';

interface EntryStore {
  entries: Entry[];
  addEntry: (entry: Entry) => void;
  removeEntry: (id: string) => void;
  getEntriesForPlot: (plotId: string) => Entry[];
  getEntryForDate: (plotId: string, date: string) => Entry | undefined;
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

export const useEntryStore = create<EntryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => {
        set((s) => ({ entries: [...s.entries, entry] }));
        getUserId().then(uid => uid && pushEntry(entry, uid));
      },
      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        pushDeleteEntry(id);
      },
      getEntriesForPlot: (plotId) => get().entries.filter((e) => e.plot_id === plotId),
      getEntryForDate: (plotId, date) =>
        get().entries.find((e) => e.plot_id === plotId && e.date === date),
    }),
    { name: 'garden-entries' }
  )
);
