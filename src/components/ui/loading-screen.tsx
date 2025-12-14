import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 animate-fade-in">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

interface SkeletonCardProps {
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 3 }) => {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - i * 10}%` }} />
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
};

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    </div>
  );
};
