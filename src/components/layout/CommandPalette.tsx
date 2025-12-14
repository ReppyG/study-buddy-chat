import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home, BookOpen, CheckSquare, FileText, Database, Timer, Bot, Settings,
  Plus, Search, ArrowRight, Clock, Sparkles
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
  keywords?: string[];
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, closeCommandPalette, recentSearches, addRecentSearch } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('');
    }
  }, [commandPaletteOpen]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'home', label: 'Go to Home', icon: Home, action: () => navigate('/'), group: 'Navigation', keywords: ['dashboard'] },
    { id: 'canvas', label: 'Go to Canvas', icon: BookOpen, action: () => navigate('/canvas'), group: 'Navigation', keywords: ['courses', 'lms'] },
    { id: 'tasks', label: 'Go to Tasks', icon: CheckSquare, action: () => navigate('/tasks'), group: 'Navigation', keywords: ['assignments', 'todo'] },
    { id: 'notes', label: 'Go to Notes', icon: FileText, action: () => navigate('/notes'), group: 'Navigation', keywords: ['documents'] },
    { id: 'databases', label: 'Go to Databases', icon: Database, action: () => navigate('/databases'), group: 'Navigation' },
    { id: 'timer', label: 'Go to Study Timer', icon: Timer, action: () => navigate('/timer'), group: 'Navigation', keywords: ['pomodoro'] },
    { id: 'ai', label: 'Go to AI Assistant', icon: Bot, action: () => navigate('/ai'), group: 'Navigation', keywords: ['chat', 'help'] },
    { id: 'settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings'), group: 'Navigation', keywords: ['preferences'] },
    
    // Quick Actions
    { id: 'new-note', label: 'Create New Note', icon: Plus, action: () => navigate('/notes?new=true'), group: 'Quick Actions' },
    { id: 'new-task', label: 'Create New Task', icon: Plus, action: () => navigate('/tasks?new=true'), group: 'Quick Actions' },
    { id: 'new-database', label: 'Create New Database', icon: Plus, action: () => navigate('/databases?new=true'), group: 'Quick Actions' },
    { id: 'start-timer', label: 'Start Study Session', icon: Timer, action: () => navigate('/timer?start=true'), group: 'Quick Actions' },
    
    // AI Commands
    { id: 'ai-help', label: 'Ask AI for Help', icon: Sparkles, action: () => navigate('/ai'), group: 'AI', keywords: ['question', 'ask'] },
    { id: 'ai-summarize', label: 'Summarize Content', icon: Sparkles, action: () => navigate('/ai?action=summarize'), group: 'AI' },
    { id: 'ai-explain', label: 'Explain a Concept', icon: Sparkles, action: () => navigate('/ai?action=explain'), group: 'AI' },
    { id: 'ai-quiz', label: 'Generate Practice Quiz', icon: Sparkles, action: () => navigate('/ai?action=quiz'), group: 'AI' },
  ], [navigate]);

  const handleSelect = (command: CommandItem) => {
    if (search) {
      addRecentSearch(search);
    }
    command.action();
    closeCommandPalette();
  };

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(lower) ||
      cmd.description?.toLowerCase().includes(lower) ||
      cmd.keywords?.some(k => k.includes(lower))
    );
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.group]) groups[cmd.group] = [];
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={(open) => !open && closeCommandPalette()}>
      <CommandInput
        placeholder="Search commands, pages, or type a question..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </div>
        </CommandEmpty>

        {!search && recentSearches.length > 0 && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.slice(0, 3).map((query, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => setSearch(query)}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {query}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {Object.entries(groupedCommands).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map(item => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item)}
                className="gap-2"
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">{item.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
