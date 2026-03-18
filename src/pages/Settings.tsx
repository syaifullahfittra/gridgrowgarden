import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useAuth } from '@/hooks/useAuth';
import { pushSettings } from '@/hooks/useSyncManager';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { gardenName, weekStart, setGardenName, setWeekStart } = useSettingsStore();
  const { user, signOut } = useAuth();

  const handleGardenNameChange = (value: string) => {
    setGardenName(value);
    if (user) {
      pushSettings(user.id, { gardenName: value, weekStart, compactView: useSettingsStore.getState().compactView });
    }
  };

  const handleWeekStartChange = (value: 'monday' | 'sunday') => {
    setWeekStart(value);
    if (user) {
      pushSettings(user.id, { gardenName, weekStart: value, compactView: useSettingsStore.getState().compactView });
    }
  };

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
          {/* Account */}
          <div className="bg-card rounded-lg border p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Account</Label>
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Syncing enabled ✓</p>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Sign in to sync across devices</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="gap-1.5">
                  <LogIn className="w-3.5 h-3.5" /> Sign in
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Garden name</Label>
            <Input
              value={gardenName}
              onChange={(e) => handleGardenNameChange(e.target.value)}
              placeholder="My Garden"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Week starts on</Label>
            <Select value={weekStart} onValueChange={(v) => handleWeekStartChange(v as 'monday' | 'sunday')}>
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
