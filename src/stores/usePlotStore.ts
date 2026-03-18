import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plot } from '@/lib/types';

interface PlotStore {
  plots: Plot[];
  addPlot: (plot: Plot) => void;
  updatePlot: (id: string, updates: Partial<Plot>) => void;
  archivePlot: (id: string) => void;
  deletePlot: (id: string) => void;
}

export const usePlotStore = create<PlotStore>()(
  persist(
    (set) => ({
      plots: [],
      addPlot: (plot) => set((s) => ({ plots: [...s.plots, plot] })),
      updatePlot: (id, updates) =>
        set((s) => ({
          plots: s.plots.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p)),
        })),
      archivePlot: (id) =>
        set((s) => ({
          plots: s.plots.map((p) => (p.id === id ? { ...p, is_archived: true } : p)),
        })),
      deletePlot: (id) => set((s) => ({ plots: s.plots.filter((p) => p.id !== id) })),
    }),
    { name: 'garden-plots' }
  )
);
