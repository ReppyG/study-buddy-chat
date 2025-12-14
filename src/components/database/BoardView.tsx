import React from 'react';
import { Database, DatabaseView, DatabaseItem, SelectOption, STATUS_OPTIONS } from '@/types/database';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardViewProps {
  database: Database;
  view: DatabaseView;
  items: DatabaseItem[];
  onItemClick: (item: DatabaseItem) => void;
  onUpdateItem: (itemId: string, updates: Partial<DatabaseItem>) => void;
  onAddItem: (defaultProperties?: Record<string, any>) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  database,
  view,
  items,
  onItemClick,
  onUpdateItem,
  onAddItem,
}) => {
  const [collapsedColumns, setCollapsedColumns] = React.useState<string[]>([]);

  const groupProperty = database.properties.find(p => p.id === view.groupByPropertyId);
  const titleProperty = database.properties.find(p => p.type === 'title');

  if (!groupProperty) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Select a property to group by in view settings</p>
      </div>
    );
  }

  const options: SelectOption[] = groupProperty.type === 'status' 
    ? STATUS_OPTIONS 
    : groupProperty.options || [];

  const getItemsForColumn = (optionId: string) => {
    return items.filter(item => item.properties[groupProperty.id] === optionId);
  };

  const toggleColumn = (optionId: string) => {
    setCollapsedColumns(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleDragStart = (e: React.DragEvent, item: DatabaseItem) => {
    e.dataTransfer.setData('itemId', item.id);
  };

  const handleDrop = (e: React.DragEvent, optionId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId && groupProperty) {
      onUpdateItem(itemId, {
        properties: { [groupProperty.id]: optionId }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
      {options.map(option => {
        const columnItems = getItemsForColumn(option.id);
        const isCollapsed = collapsedColumns.includes(option.id);

        return (
          <div
            key={option.id}
            className={cn(
              'flex-shrink-0 bg-muted/30 rounded-lg transition-all',
              isCollapsed ? 'w-10' : 'w-72'
            )}
            onDrop={(e) => handleDrop(e, option.id)}
            onDragOver={handleDragOver}
          >
            <div 
              className={cn(
                'p-3 flex items-center gap-2 cursor-pointer',
                isCollapsed && 'flex-col'
              )}
              onClick={() => isCollapsed && toggleColumn(option.id)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleColumn(option.id);
                }}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              <Badge className={cn('text-white', option.color)}>
                {option.label}
              </Badge>
              
              <span className="text-muted-foreground text-sm">
                {columnItems.length}
              </span>
            </div>

            {!isCollapsed && (
              <div className="p-2 space-y-2">
                {columnItems.map(item => (
                  <Card
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => onItemClick(item)}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">
                        {item.properties[titleProperty?.id || ''] || 'Untitled'}
                      </p>
                      {database.properties
                        .filter(p => p.type !== 'title' && p.id !== groupProperty.id && !view.hiddenProperties.includes(p.id))
                        .slice(0, 2)
                        .map(prop => (
                          <div key={prop.id} className="text-xs text-muted-foreground mt-1">
                            {prop.name}: {String(item.properties[prop.id] || '-')}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddItem({ [groupProperty.id]: option.id })}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Uncategorized column */}
      <div
        className="flex-shrink-0 w-72 bg-muted/30 rounded-lg"
        onDrop={(e) => handleDrop(e, '')}
        onDragOver={handleDragOver}
      >
        <div className="p-3 flex items-center gap-2">
          <Badge variant="outline">No Status</Badge>
          <span className="text-muted-foreground text-sm">
            {items.filter(i => !i.properties[groupProperty.id]).length}
          </span>
        </div>
        <div className="p-2 space-y-2">
          {items
            .filter(i => !i.properties[groupProperty.id])
            .map(item => (
              <Card
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => onItemClick(item)}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <CardContent className="p-3">
                  <p className="font-medium text-sm">
                    {item.properties[titleProperty?.id || ''] || 'Untitled'}
                  </p>
                </CardContent>
              </Card>
            ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddItem({})}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
