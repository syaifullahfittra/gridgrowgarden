import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay, subYears, isAfter } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Entry, ColorThemeKey } from '@/lib/types';
import { getColorForIntensity } from '@/lib/types';

interface MosaicGridProps {
  entries: Entry[];
  colorTheme: ColorThemeKey;
  startDate?: string;
  compact?: boolean;
}

export function MosaicGrid({ entries, colorTheme, startDate, compact = false }: MosaicGridProps) {
  const { weeks, months } = useMemo(() => {
    const now = new Date();
    const yearStart = startDate && isAfter(new Date(startDate), subYears(now, 1))
      ? new Date(startDate)
      : subYears(now, 1);
    
    const days = eachDayOfInterval({ start: yearStart, end: now });
    
    // Build entry map
    const entryMap = new Map<string, number>();
    entries.forEach((e) => {
      const key = e.date;
      entryMap.set(key, (entryMap.get(key) || 0) + e.value);
    });

    // Find max for normalization
    const values = Array.from(entryMap.values());
    const maxVal = Math.max(...values, 1);

    // Group by weeks
    const weeks: { date: Date; level: 0 | 1 | 2 | 3 | 4; count: number }[][] = [];
    let currentWeek: { date: Date; level: 0 | 1 | 2 | 3 | 4; count: number }[] = [];
    
    // Pad first week
    const firstDayOfWeek = getDay(days[0]);
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push({ date: new Date(0), level: 0, count: 0 });
    }

    days.forEach((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const count = entryMap.get(key) || 0;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count > 0) {
        const ratio = count / maxVal;
        if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }
      currentWeek.push({ date: day, level, count });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Get month labels
    const months: { label: string; index: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const validDay = week.find((d) => d.date.getTime() > 0);
      if (validDay) {
        const m = validDay.date.getMonth();
        if (m !== lastMonth) {
          months.push({ label: format(validDay.date, 'MMM'), index: i });
          lastMonth = m;
        }
      }
    });

    return { weeks, months };
  }, [entries, colorTheme, startDate]);

  const size = compact ? 10 : 13;
  const gap = compact ? 2 : 3;

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1" style={{ paddingLeft: 0 }}>
        {months.map((m) => (
          <span
            key={m.label + m.index}
            className="text-[10px] text-muted-foreground"
            style={{ position: 'relative', left: m.index * (size + gap) }}
          >
            {m.label}
          </span>
        ))}
      </div>
      {/* Grid */}
      <div className="flex" style={{ gap }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap }}>
            {week.map((day, di) => {
              if (day.date.getTime() === 0) {
                return <div key={di} style={{ width: size, height: size }} />;
              }
              return (
                <Tooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      className="garden-square cursor-pointer"
                      style={{
                        width: size,
                        height: size,
                        backgroundColor: getColorForIntensity(colorTheme, day.level),
                      }}
                      aria-label={`${format(day.date, 'MMM d')} — ${day.count} entries`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{format(day.date, 'MMM d, yyyy')}</p>
                    <p className="text-muted-foreground">{day.count} {day.count === 1 ? 'entry' : 'entries'}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
