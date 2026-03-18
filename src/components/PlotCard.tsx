import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MosaicGrid } from './MosaicGrid';
import { useEntryStore } from '@/stores/useEntryStore';
import { getGrowthStage, GROWTH_LABELS } from '@/lib/types';
import type { Plot } from '@/lib/types';
import { useShallow } from 'zustand/react/shallow';

interface PlotCardProps {
  plot: Plot;
  compact?: boolean;
  index?: number;
}

export function PlotCard({ plot, compact = false, index = 0 }: PlotCardProps) {
  const navigate = useNavigate();
  const entries = useEntryStore(useShallow((s) => s.entries.filter((e) => e.plot_id === plot.id)));
  const addEntry = useEntryStore((s) => s.addEntry);

  const stage = useMemo(() => getGrowthStage(entries.length), [entries.length]);

  const today = new Date().toISOString().split('T')[0];
  const loggedToday = entries.some((e) => e.date === today);

  const handleQuickLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loggedToday) return;
    addEntry({
      id: crypto.randomUUID(),
      plot_id: plot.id,
      date: today,
      value: 1,
      is_backdated: false,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/plot/${plot.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{plot.icon}</span>
          <h3 className="font-serif text-lg text-card-foreground">{plot.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{GROWTH_LABELS[stage]}</span>
          <button
            onClick={handleQuickLog}
            disabled={loggedToday}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-all ${
              loggedToday
                ? 'bg-primary/20 text-primary cursor-default'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
            }`}
            aria-label={loggedToday ? 'Already logged today' : 'Quick log today'}
          >
            {loggedToday ? '✓' : '+'}
          </button>
        </div>
      </div>
      <MosaicGrid
        entries={entries}
        colorTheme={plot.color_theme}
        startDate={plot.start_date}
        compact={compact}
      />
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span>{entries.length} total</span>
        <span>·</span>
        <span className="capitalize">{plot.frequency}</span>
        {plot.target_per_period && (
          <>
            <span>·</span>
            <span>Target: {plot.target_per_period}{plot.unit ? ` ${plot.unit}` : ''}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
