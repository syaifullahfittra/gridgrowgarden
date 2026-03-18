import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { usePlotStore } from '@/stores/usePlotStore';
import { useEntryStore } from '@/stores/useEntryStore';
import { useZoneStore } from '@/stores/useZoneStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Plot, Entry, Zone } from '@/lib/types';

export function useSyncManager() {
  const { user } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    pullAll(user.id);
  }, [user]);

  // Reset sync flag on user change
  useEffect(() => {
    if (!user) hasSynced.current = false;
  }, [user?.id]);
}

async function pullAll(userId: string) {
  try {
    // Pull zones
    const { data: remoteZones } = await supabase.from('zones').select('*').eq('user_id', userId);
    const zoneStore = useZoneStore.getState();
    
    if (remoteZones && remoteZones.length > 0) {
      // Merge remote zones into local store (remote wins)
      const localZones = zoneStore.zones;
      const mergedZones: Zone[] = [];
      const remoteIds = new Set(remoteZones.map(z => z.id));
      
      // Add all remote zones
      remoteZones.forEach(z => mergedZones.push({
        id: z.id,
        name: z.name,
        sort_order: z.sort_order,
        created_at: z.created_at,
      }));
      
      // Push local-only zones to remote
      const localOnly = localZones.filter(z => !remoteIds.has(z.id) && !z.id.startsWith('zone-'));
      for (const z of localOnly) {
        const { error } = await supabase.from('zones').insert({
          id: z.id, user_id: userId, name: z.name, sort_order: z.sort_order,
        });
        if (!error) mergedZones.push(z);
      }
      
      // Push default zones if none exist remotely
      if (remoteZones.length === 0) {
        for (const z of localZones) {
          await supabase.from('zones').insert({
            id: z.id, user_id: userId, name: z.name, sort_order: z.sort_order,
          });
          mergedZones.push(z);
        }
      }
      
      useZoneStore.setState({ zones: mergedZones });
    } else {
      // No remote zones - push default locals
      const localZones = zoneStore.zones;
      for (const z of localZones) {
        await supabase.from('zones').insert({
          id: z.id, user_id: userId, name: z.name, sort_order: z.sort_order,
        });
      }
    }

    // Pull plots
    const { data: remotePlots } = await supabase.from('plots').select('*').eq('user_id', userId);
    const plotStore = usePlotStore.getState();
    
    if (remotePlots && remotePlots.length > 0) {
      const remotePlotsMapped: Plot[] = remotePlots.map(p => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        zone_id: p.zone_id || '',
        frequency: p.frequency as Plot['frequency'],
        entry_type: p.entry_type as Plot['entry_type'],
        unit: p.unit || undefined,
        target_per_period: p.target_per_period || undefined,
        color_theme: p.color_theme as Plot['color_theme'],
        start_date: p.start_date,
        description: p.description || undefined,
        is_archived: p.is_archived,
        is_shareable: p.is_shareable,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));
      
      // Push local-only plots
      const remoteIds = new Set(remotePlots.map(p => p.id));
      const localOnly = plotStore.plots.filter(p => !remoteIds.has(p.id));
      for (const p of localOnly) {
        const { error } = await supabase.from('plots').insert({
          id: p.id, user_id: userId, name: p.name, icon: p.icon,
          zone_id: p.zone_id || null, frequency: p.frequency, entry_type: p.entry_type,
          unit: p.unit || null, target_per_period: p.target_per_period || null,
          color_theme: p.color_theme, start_date: p.start_date,
          description: p.description || null, is_archived: p.is_archived, is_shareable: p.is_shareable,
        });
        if (!error) remotePlotsMapped.push(p);
      }
      
      usePlotStore.setState({ plots: remotePlotsMapped });
    } else {
      // Push all local plots
      for (const p of plotStore.plots) {
        await supabase.from('plots').insert({
          id: p.id, user_id: userId, name: p.name, icon: p.icon,
          zone_id: p.zone_id || null, frequency: p.frequency, entry_type: p.entry_type,
          unit: p.unit || null, target_per_period: p.target_per_period || null,
          color_theme: p.color_theme, start_date: p.start_date,
          description: p.description || null, is_archived: p.is_archived, is_shareable: p.is_shareable,
        });
      }
    }

    // Pull entries
    const { data: remoteEntries } = await supabase.from('entries').select('*').eq('user_id', userId);
    const entryStore = useEntryStore.getState();
    
    if (remoteEntries && remoteEntries.length > 0) {
      const remoteEntriesMapped: Entry[] = remoteEntries.map(e => ({
        id: e.id,
        plot_id: e.plot_id,
        date: e.date,
        value: Number(e.value),
        intensity: e.intensity as Entry['intensity'],
        note: e.note || undefined,
        is_backdated: e.is_backdated,
        created_at: e.created_at,
      }));
      
      const remoteIds = new Set(remoteEntries.map(e => e.id));
      const localOnly = entryStore.entries.filter(e => !remoteIds.has(e.id));
      for (const e of localOnly) {
        const { error } = await supabase.from('entries').insert({
          id: e.id, plot_id: e.plot_id, user_id: userId,
          date: e.date, value: e.value, intensity: e.intensity || null,
          note: e.note || null, is_backdated: e.is_backdated,
        });
        if (!error) remoteEntriesMapped.push(e);
      }
      
      useEntryStore.setState({ entries: remoteEntriesMapped });
    } else {
      for (const e of entryStore.entries) {
        await supabase.from('entries').insert({
          id: e.id, plot_id: e.plot_id, user_id: userId,
          date: e.date, value: e.value, intensity: e.intensity || null,
          note: e.note || null, is_backdated: e.is_backdated,
        });
      }
    }

    // Pull settings
    const { data: remoteSettings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
    if (remoteSettings) {
      useSettingsStore.setState({
        gardenName: remoteSettings.garden_name,
        weekStart: remoteSettings.week_start as 'monday' | 'sunday',
        compactView: remoteSettings.compact_view,
      });
    } else {
      const settings = useSettingsStore.getState();
      await supabase.from('user_settings').insert({
        user_id: userId,
        garden_name: settings.gardenName,
        week_start: settings.weekStart,
        compact_view: settings.compactView,
      });
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

// Push helpers for use in stores
export async function pushPlot(plot: Plot, userId: string) {
  await supabase.from('plots').upsert({
    id: plot.id, user_id: userId, name: plot.name, icon: plot.icon,
    zone_id: plot.zone_id || null, frequency: plot.frequency, entry_type: plot.entry_type,
    unit: plot.unit || null, target_per_period: plot.target_per_period || null,
    color_theme: plot.color_theme, start_date: plot.start_date,
    description: plot.description || null, is_archived: plot.is_archived, is_shareable: plot.is_shareable,
  });
}

export async function pushEntry(entry: Entry, userId: string) {
  await supabase.from('entries').upsert({
    id: entry.id, plot_id: entry.plot_id, user_id: userId,
    date: entry.date, value: entry.value, intensity: entry.intensity || null,
    note: entry.note || null, is_backdated: entry.is_backdated,
  });
}

export async function pushDeletePlot(plotId: string) {
  await supabase.from('entries').delete().eq('plot_id', plotId);
  await supabase.from('plots').delete().eq('id', plotId);
}

export async function pushDeleteEntry(entryId: string) {
  await supabase.from('entries').delete().eq('id', entryId);
}

export async function pushSettings(userId: string, settings: { gardenName: string; weekStart: string; compactView: boolean }) {
  await supabase.from('user_settings').upsert({
    user_id: userId,
    garden_name: settings.gardenName,
    week_start: settings.weekStart,
    compact_view: settings.compactView,
  });
}
