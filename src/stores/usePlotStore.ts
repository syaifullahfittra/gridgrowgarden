import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plot } from '@/lib/types';
import { pushPlot, pushDeletePlot } from '@/hooks/useSyncManager';
import { supabase } from '@/integrations/supabase/client';

interface PlotStore {
  plots: Plot[];
  addPlot: (plot: Plot) => void;
  updatePlot: (id: string, updates: Partial<Plot>) => void;
  archivePlot: (id: string) => void;
  deletePlot: (id: string) => void;
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

export const usePlotStore = create<PlotStore>()(
  persist(
    (set, get) => ({
      plots: [],
      addPlot: (plot) => {
        set((s) => ({ plots: [...s.plots, plot] }));
        getUserId().then(uid => uid && pushPlot(plot, uid));
      },
      updatePlot: (id, updates) => {
        set((s) => ({
          plots: s.plots.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)),
        }));
        const updated = get().plots.find(p => p.id === id);
        if (updated) getUserId().then(uid => uid && pushPlot(updated, uid));
      },
      archivePlot: (id) => {
        set((s) => ({
          plots: s.plots.map((p) => (p.id === id ? { ...p, is_archived: true } : p)),
        }));
        const updated = get().plots.find(p => p.id === id);
        if (updated) getUserId().then(uid => uid && pushPlot(updated, uid));
      },
      deletePlot: (id) => {
        set((s) => ({ plots: s.plots.filter((p) => p.id !== id) }));
        pushDeletePlot(id);
      },
    }),
    { name: 'garden-plots' }
  )
);
