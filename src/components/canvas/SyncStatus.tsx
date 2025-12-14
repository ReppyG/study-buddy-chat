// Canvas sync status and controls
import { RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import type { CanvasSyncState } from '@/types/canvas';

interface SyncStatusProps {
  syncState: CanvasSyncState;
  onSync: () => void;
  disabled?: boolean;
}

export function SyncStatus({ syncState, onSync, disabled }: SyncStatusProps) {
  const { lastSync, isSyncing, syncProgress, error } = syncState;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {lastSync ? (
            <span>Last synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}</span>
          ) : (
            <span>Never synced</span>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSync}
          disabled={isSyncing || disabled}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
      
      {isSyncing && (
        <div className="space-y-1">
          <Progress value={syncProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {syncProgress < 20 && 'Fetching courses...'}
            {syncProgress >= 20 && syncProgress < 70 && 'Fetching assignments...'}
            {syncProgress >= 70 && syncProgress < 90 && 'Fetching announcements...'}
            {syncProgress >= 90 && 'Finishing up...'}
          </p>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
