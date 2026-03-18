import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { gardenName, weekStart, setGardenName, setWeekStart } = useSettingsStore();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-2xl">Settings</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div>
            <Label className="text-xs text-muted-foreground">Garden name</Label>
            <Input
              value={gardenName}
              onChange={(e) => setGardenName(e.target.value)}
              placeholder="My Garden"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Week starts on</Label>
            <Select value={weekStart} onValueChange={(v) => setWeekStart(v as 'monday' | 'sunday')}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Garden v1.0 — Grow consistently, grow visibly, grow fully. 🌱
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
