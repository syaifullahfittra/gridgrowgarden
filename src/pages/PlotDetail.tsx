import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { MosaicGrid } from '@/components/MosaicGrid';
import { Button } from '@/components/ui/button';
import { usePlotStore } from '@/stores/usePlotStore';
import { useEntryStore } from '@/stores/useEntryStore';
import { useZoneStore } from '@/stores/useZoneStore';
import { getGrowthStage, GROWTH_LABELS } from '@/lib/types';

export default function PlotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const plot = usePlotStore((s) => s.plots.find((p) => p.id === id));
  const entries = useEntryStore((s) => s.entries.filter((e) => e.plot_id === id));
  const zones = useZoneStore((s) => s.zones);
  const deletePlot = usePlotStore((s) => s.deletePlot);

  if (!plot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Plot not found</p>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-2">Go back</Button>
        </div>
      </div>
    );
  }

  const stage = getGrowthStage(entries.length);
  const zone = zones.find((z) => z.id === plot.zone_id);

  // Streak calculation
  const sortedDates = [...new Set(entries.map((e) => e.date))].sort().reverse();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const d = new Date(sortedDates[i]);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (d.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
      currentStreak++;
    } else if (i === 0) {
      // Check if yesterday
      expected.setDate(expected.getDate());
    }
  }

  // Simple longest streak
  sortedDates.sort();
  tempStreak = 1;
  longestStreak = sortedDates.length > 0 ? 1 : 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const handleDelete = () => {
    deletePlot(plot.id);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-2xl">{plot.icon}</span>
          <div className="flex-1">
            <h1 className="font-serif text-2xl">{plot.name}</h1>
            {zone && <p className="text-xs text-muted-foreground">{zone.name} · {GROWTH_LABELS[stage]}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { label: 'Total entries', value: entries.length },
            { label: 'Current streak', value: `${currentStreak}d` },
            { label: 'Longest streak', value: `${longestStreak}d` },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg border p-3 text-center">
              <p className="text-2xl font-serif">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Mosaic */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-lg border p-4 mb-6"
        >
          <MosaicGrid entries={entries} colorTheme={plot.color_theme} startDate={plot.start_date} />
        </motion.div>

        {/* Description */}
        {plot.description && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-lg border p-4 mb-6"
          >
            <h3 className="text-xs text-muted-foreground mb-1">Why I do this</h3>
            <p className="text-sm">{plot.description}</p>
          </motion.div>
        )}

        {/* Entry history */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h3 className="text-xs text-muted-foreground mb-3">Recent entries</h3>
          <div className="space-y-2">
            {entries.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20).map((entry) => (
              <div key={entry.id} className="bg-card rounded-lg border px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {plot.entry_type === 'boolean' ? '✓' : `${entry.value} ${plot.unit || ''}`}
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No entries yet. Start logging!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
