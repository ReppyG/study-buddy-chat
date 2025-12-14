import React from 'react';
import { Database, DatabaseView, DatabaseItem, STATUS_OPTIONS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ListViewProps {
  database: Database;
  view: DatabaseView;
  items: DatabaseItem[];
  onItemClick: (item: DatabaseItem) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  database,
  view,
  items,
  onItemClick,
  onAddItem,
  onDeleteItem,
}) => {
  const titleProperty = database.properties.find(p => p.type === 'title');
  const visibleProperties = database.properties
    .filter(p => p.type !== 'title' && !view.hiddenProperties.includes(p.id))
    .slice(0, 3);

  const renderPropertyValue = (property: typeof database.properties[0], value: any) => {
    if (!value) return <span className="text-muted-foreground">-</span>;

    switch (property.type) {
      case 'status': {
        const option = STATUS_OPTIONS.find(o => o.id === value);
        return option ? (
          <Badge className={cn('text-white text-xs', option.color)}>{option.label}</Badge>
        ) : value;
      }
      case 'select': {
        const option = property.options?.find(o => o.id === value);
        return option ? (
          <Badge className={cn('text-white text-xs', option.color)}>{option.label}</Badge>
        ) : value;
      }
      case 'date':
        return format(new Date(value), 'MMM d, yyyy');
      case 'checkbox':
        return value ? '✓' : '✗';
      case 'rating':
        return '⭐'.repeat(value);
      default:
        return String(value);
    }
  };

  return (
    <div className="space-y-1">
      {items.map(item => (
        <div
          key={item.id}
          onClick={() => onItemClick(item)}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/30 cursor-pointer group transition-colors"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">
              {item.properties[titleProperty?.id || ''] || 'Untitled'}
            </h4>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {visibleProperties.map(prop => (
              <div key={prop.id} className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs font-medium hidden sm:inline">{prop.name}:</span>
                {renderPropertyValue(prop, item.properties[prop.id])}
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        onClick={onAddItem}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Plus className="w-4 h-4 mr-2" />
        New item
      </Button>
    </div>
  );
};
