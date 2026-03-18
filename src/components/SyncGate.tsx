import { useSyncManager } from '@/hooks/useSyncManager';

export function SyncGate() {
  useSyncManager();
  return null;
}
