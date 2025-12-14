import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Home, BookOpen, CheckSquare, FileText, Database, Timer, Bot, Settings,
  ChevronRight, ChevronDown, PanelLeftClose, PanelLeft, Sparkles, Plus,
  CalendarDays, Trophy, FolderOpen, BookMarked, Layers, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { label: string; path: string; icon?: React.ElementType }[];
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/' },
  {
    label: 'Canvas',
    icon: BookOpen,
    path: '/canvas',
    children: [
      { label: 'Dashboard', path: '/canvas', icon: Layers },
      { label: 'All Courses', path: '/canvas/courses', icon: BookMarked },
      { label: 'Grades Overview', path: '/canvas/grades', icon: Trophy },
    ],
  },
  {
    label: 'Tasks',
    icon: CheckSquare,
    path: '/tasks',
    children: [
      { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
      { label: 'This Week', path: '/tasks/week', icon: CalendarDays },
      { label: 'Completed', path: '/tasks/completed', icon: Trophy },
    ],
  },
  {
    label: 'Notes',
    icon: FileText,
    path: '/notes',
    children: [
      { label: 'All Notes', path: '/notes', icon: FileText },
      { label: 'Class Notes', path: '/notes/class', icon: FolderOpen },
      { label: 'Study Guides', path: '/notes/guides', icon: BookMarked },
    ],
  },
  {
    label: 'Databases',
    icon: Database,
    path: '/databases',
  },
  { label: 'Study Timer', icon: Timer, path: '/timer' },
  { label: 'AI Assistant', icon: Bot, path: '/ai' },
  { label: 'Help', icon: HelpCircle, path: '/help' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useApp();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Canvas', 'Tasks', 'Notes']);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-card border-r border-border flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Study Buddy</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(sidebarCollapsed && 'mx-auto')}
        >
          {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.label);
            const active = isActive(item.path);

            if (hasChildren && !sidebarCollapsed) {
              return (
                <Collapsible
                  key={item.label}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(item.label)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 mt-1 space-y-1">
                    {item.children?.map(child => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )
                          }
                        >
                          {ChildIcon && <ChildIcon className="w-4 h-4 flex-shrink-0" />}
                          <span>{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    sidebarCollapsed && 'justify-center'
                  )
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Quick Add */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            Quick Add
          </Button>
        </div>
      )}
    </aside>
  );
};
