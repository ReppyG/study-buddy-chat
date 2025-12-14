// Canvas connection status indicator
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import type { ConnectionStatus as ConnectionStatusType } from '@/types/canvas';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  userName?: string;
  canvasUrl?: string;
  testMode?: boolean;
}

export function ConnectionStatus({ status, userName, canvasUrl, testMode }: ConnectionStatusProps) {
  const statusConfig = {
    disconnected: {
      icon: X,
      text: 'Not Connected',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    testing: {
      icon: Loader2,
      text: 'Testing...',
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    connected: {
      icon: Check,
      text: 'Connected',
      className: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    error: {
      icon: AlertCircle,
      text: 'Connection Error',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.className}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${status === 'testing' ? 'animate-spin' : ''}`} />
        <span className="font-medium">{config.text}</span>
        {testMode && status === 'connected' && (
          <span className="ml-2 rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-500">
            Test Mode
          </span>
        )}
      </div>
      
      {status === 'connected' && userName && (
        <div className="mt-2 text-sm opacity-80">
          <p>Signed in as: <span className="font-medium">{userName}</span></p>
          {canvasUrl && <p>Canvas: {canvasUrl}</p>}
        </div>
      )}
    </div>
  );
}
