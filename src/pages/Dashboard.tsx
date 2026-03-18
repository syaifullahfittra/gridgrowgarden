import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shrub, Maximize2, Minimize2 } from 'lucide-react';
import { PlotCard } from '@/components/PlotCard';
import { CreatePlotDialog } from '@/components/CreatePlotDialog';
import { usePlotStore } from '@/stores/usePlotStore';
import { useZoneStore } from '@/stores/useZoneStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/button';
import { useShallow } from 'zustand/react/shallow';

export default function Dashboard() {
  const plots = usePlotStore((s) => s.plots.filter((p) => !p.is_archived));
  const zones = useZoneStore((s) => s.zones);
  const { gardenName, compactView, toggleCompactView } = useSettingsStore();

  const groupedPlots = useMemo(() => {
    const grouped = new Map<string, typeof plots>();
    zones.forEach((z) => grouped.set(z.id, []));
    grouped.set('uncategorized', []);
    plots.forEach((p) => {
      const list = grouped.get(p.zone_id) || grouped.get('uncategorized')!;
      list.push(p);
    });
    return grouped;
  }, [plots, zones]);

  const isEmpty = plots.length === 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-serif text-3xl">{gardenName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {plots.length} {plots.length === 1 ? 'plot' : 'plots'} growing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleCompactView} className="text-muted-foreground">
              {compactView ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>

        {/* Empty state */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shrub className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-xl mb-2">Your garden is empty</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Plant your first plot to start tracking a habit, skill, or project.
            </p>
            <CreatePlotDialog>
              <Button size="lg">Plant your first plot 🌱</Button>
            </CreatePlotDialog>
          </motion.div>
        )}

        {/* Zones with plots */}
        {!isEmpty && (
          <div className="space-y-8">
            {zones.map((zone) => {
              const zonePlots = groupedPlots.get(zone.id) || [];
              if (zonePlots.length === 0) return null;
              return (
                <motion.section
                  key={zone.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {zone.name}
                  </h2>
                  <div className={compactView ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-4'}>
                    {zonePlots.map((plot, i) => (
                      <PlotCard key={plot.id} plot={plot} compact={compactView} index={i} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
            {/* Uncategorized */}
            {(groupedPlots.get('uncategorized')?.length ?? 0) > 0 && (
              <section>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Other</h2>
                <div className={compactView ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-4'}>
                  {groupedPlots.get('uncategorized')!.map((plot, i) => (
                    <PlotCard key={plot.id} plot={plot} compact={compactView} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
