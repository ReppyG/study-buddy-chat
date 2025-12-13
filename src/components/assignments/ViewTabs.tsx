/*
  VIEW TABS COMPONENT
  ===================
  Tab navigation for switching between views
*/

import { ViewType } from '@/types/assignment';
import { List, CalendarDays, Columns, AlertTriangle } from 'lucide-react';

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  urgentCount: number;
}

const views: { type: ViewType; label: string; icon: React.ReactNode }[] = [
  { type: 'list', label: 'List', icon: <List className="w-4 h-4" /> },
  { type: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
  { type: 'board', label: 'Board', icon: <Columns className="w-4 h-4" /> },
  { type: 'urgent', label: 'Urgent', icon: <AlertTriangle className="w-4 h-4" /> },
];

export function ViewTabs({ activeView, onViewChange, urgentCount }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
      {views.map(view => (
        <button
          key={view.type}
          onClick={() => onViewChange(view.type)}
          className={`
            relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
            ${activeView === view.type
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
          
          {/* Urgent badge */}
          {view.type === 'urgent' && urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground rounded-full">
              {urgentCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
