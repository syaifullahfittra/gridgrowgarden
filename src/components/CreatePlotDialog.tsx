import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { usePlotStore } from '@/stores/usePlotStore';
import { useZoneStore } from '@/stores/useZoneStore';
import { COLOR_THEMES, type ColorThemeKey, type Frequency, type EntryType, getColorForIntensity } from '@/lib/types';
import { Plus } from 'lucide-react';

interface CreatePlotDialogProps {
  children?: React.ReactNode;
}

const EMOJI_OPTIONS = ['📚', '🏋️', '🎸', '💻', '🧘', '✍️', '🎨', '🏃', '🧠', '🌍', '📝', '🎯', '🔬', '🎹', '📖', '🧪'];

export function CreatePlotDialog({ children }: CreatePlotDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🌱');
  const [zoneId, setZoneId] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [entryType, setEntryType] = useState<EntryType>('boolean');
  const [unit, setUnit] = useState('');
  const [target, setTarget] = useState('');
  const [colorTheme, setColorTheme] = useState<ColorThemeKey>('forest');
  const [description, setDescription] = useState('');

  const addPlot = usePlotStore((s) => s.addPlot);
  const zones = useZoneStore((s) => s.zones);

  const handleCreate = () => {
    if (!name.trim()) return;
    const plot = {
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
      zone_id: zoneId || zones[0]?.id || '',
      frequency,
      entry_type: entryType,
      unit: entryType === 'quantitative' ? unit : undefined,
      target_per_period: target ? Number(target) : undefined,
      color_theme: colorTheme,
      start_date: new Date().toISOString().split('T')[0],
      description: description || undefined,
      is_archived: false,
      is_shareable: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addPlot(plot);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setIcon('🌱'); setZoneId(''); setFrequency('daily');
    setEntryType('boolean'); setUnit(''); setTarget(''); setColorTheme('forest');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> New Plot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Plant a new plot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Icon */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all ${
                    icon === emoji ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Read 30 minutes" className="mt-1" />
          </div>

          {/* Zone */}
          <div>
            <Label className="text-xs text-muted-foreground">Zone</Label>
            <Select value={zoneId || zones[0]?.id} onValueChange={setZoneId}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-xs text-muted-foreground">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entry type */}
          <div>
            <Label className="text-xs text-muted-foreground">Entry type</Label>
            <Select value={entryType} onValueChange={(v) => setEntryType(v as EntryType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Did it / Didn't</SelectItem>
                <SelectItem value="quantitative">Quantitative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {entryType === 'quantitative' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Unit</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="minutes" className="mt-1" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Target per period</Label>
                <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="30" className="mt-1" />
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Color theme</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(COLOR_THEMES) as ColorThemeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
                    colorTheme === key ? 'ring-2 ring-primary bg-primary/10' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((l) => (
                      <div key={l} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColorForIntensity(key, l as 1|2|3|4) }} />
                    ))}
                  </div>
                  <span className="ml-1">{COLOR_THEMES[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Why this matters (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why are you tracking this?" className="mt-1" rows={2} />
          </div>

          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">
            Plant it 🌱
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
