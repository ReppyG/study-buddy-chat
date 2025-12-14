import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileText, CheckSquare, Database, BookOpen, MessageSquare,
  Plus, ArrowRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  illustration?: 'notes' | 'tasks' | 'database' | 'canvas' | 'chat' | 'success';
  className?: string;
}

const illustrations = {
  notes: (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl rotate-6" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl -rotate-3" />
      <div className="absolute inset-0 bg-card rounded-2xl border border-border flex items-center justify-center">
        <FileText className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  ),
  tasks: (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl rotate-6" />
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl -rotate-3" />
      <div className="absolute inset-0 bg-card rounded-2xl border border-border flex items-center justify-center">
        <CheckSquare className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  ),
  database: (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-2xl rotate-6" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/30 rounded-2xl -rotate-3" />
      <div className="absolute inset-0 bg-card rounded-2xl border border-border flex items-center justify-center">
        <Database className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  ),
  canvas: (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl rotate-6" />
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-2xl -rotate-3" />
      <div className="absolute inset-0 bg-card rounded-2xl border border-border flex items-center justify-center">
        <BookOpen className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  ),
  chat: (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl rotate-6" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl -rotate-3" />
      <div className="absolute inset-0 bg-card rounded-2xl border border-border flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-muted-foreground" />
      </div>
    </div>
  ),
  success: (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full animate-pulse" />
      <div className="absolute inset-2 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full" />
      <div className="absolute inset-4 bg-card rounded-full border border-border flex items-center justify-center">
        <span className="text-3xl">🎉</span>
      </div>
    </div>
  ),
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {illustration && illustrations[illustration]}
      {Icon && !illustration && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold mt-4 mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {action && (
          action.href ? (
            <Link to={action.href}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} className="gap-2">
              <Plus className="w-4 h-4" />
              {action.label}
            </Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Link to={secondaryAction.href}>
              <Button variant="outline" className="gap-2">
                {secondaryAction.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick} className="gap-2">
              {secondaryAction.label}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )
        )}
      </div>
    </div>
  );
};
// Pre-configured empty states
export const NoAssignments: React.FC = () => (
  <EmptyState
    illustration="success"
    title="All caught up! 🎉"
    description="You have no pending assignments. Time to relax or get ahead on other work."
    action={{ label: 'Add Assignment', href: '/tasks?new=true' }}
  />
);

export const NoNotes: React.FC = () => (
  <EmptyState
    illustration="notes"
    title="Start your first note"
    description="Create notes, study guides, and organize your thoughts in one place."
    action={{ label: 'Create Note', href: '/notes?new=true' }}
  />
);

export const NoDatabases: React.FC = () => (
  <EmptyState
    illustration="database"
    title="No databases yet"
    description="Create databases to organize assignments, resources, flashcards, and more."
    action={{ label: 'Create Database', href: '/databases?new=true' }}
  />
);

export const CanvasNotConnected: React.FC = () => (
  <EmptyState
    illustration="canvas"
    title="Connect Canvas to get started"
    description="Import your courses, assignments, and grades from Canvas LMS."
    action={{ label: 'Connect Canvas', href: '/settings' }}
    secondaryAction={{ label: 'Learn More', href: '/help/canvas' }}
  />
);

export const NoChatHistory: React.FC = () => (
  <EmptyState
    illustration="chat"
    title="Start a conversation"
    description="Ask Study Buddy AI anything about your courses, assignments, or study strategies."
  />
);
