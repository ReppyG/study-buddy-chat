import React from 'react';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Database as DbIcon, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseSidebarProps {
  databases: Database[];
  activeDatabaseId: string | null;
  onSelectDatabase: (id: string) => void;
  onCreateDatabase: (templateIndex?: number) => void;
  onDeleteDatabase: (id: string) => void;
  templates: Partial<Database>[];
}

export const DatabaseSidebar: React.FC<DatabaseSidebarProps> = ({
  databases,
  activeDatabaseId,
  onSelectDatabase,
  onCreateDatabase,
  onDeleteDatabase,
  templates,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showTemplates, setShowTemplates] = React.useState(false);

  const filteredDatabases = databases.filter(db =>
    db.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-r border-border h-full flex flex-col bg-card/50">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <DbIcon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Databases</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredDatabases.map(db => (
            <div
              key={db.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer group transition-colors',
                activeDatabaseId === db.id ? 'bg-accent' : 'hover:bg-accent/50'
              )}
              onClick={() => onSelectDatabase(db.id)}
            >
              <span className="text-lg">{db.icon}</span>
              <span className="flex-1 truncate text-sm">{db.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDatabase(db.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}

          {filteredDatabases.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No databases found
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Database
        </Button>

        {showTemplates && (
          <div className="space-y-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => {
                onCreateDatabase();
                setShowTemplates(false);
              }}
            >
              📋 Empty Database
            </Button>
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => {
                  onCreateDatabase(index);
                  setShowTemplates(false);
                }}
              >
                {template.icon} {template.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
