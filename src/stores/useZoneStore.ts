import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Zone } from '@/lib/types';

const DEFAULT_ZONES: Zone[] = [
  { id: 'zone-body', name: 'Body', sort_order: 0, created_at: new Date().toISOString() },
  { id: 'zone-mind', name: 'Mind', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'zone-craft', name: 'Craft', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'zone-build', name: 'Build', sort_order: 3, created_at: new Date().toISOString() },
];

interface ZoneStore {
  zones: Zone[];
  addZone: (zone: Zone) => void;
  updateZone: (id: string, updates: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
}

export const useZoneStore = create<ZoneStore>()(
  persist(
    (set) => ({
      zones: DEFAULT_ZONES,
      addZone: (zone) => set((s) => ({ zones: [...s.zones, zone] })),
      updateZone: (id, updates) =>
        set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, ...updates } : z)) })),
      deleteZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),
    }),
    { name: 'garden-zones' }
  )
);
