import React from 'react';
import { Database, DatabaseView, DatabaseItem } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryViewProps {
  database: Database;
  view: DatabaseView;
  items: DatabaseItem[];
  onItemClick: (item: DatabaseItem) => void;
  onAddItem: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  database,
  view,
  items,
  onItemClick,
  onAddItem,
}) => {
  const titleProperty = database.properties.find(p => p.type === 'title');
  const visibleProperties = database.properties
    .filter(p => p.type !== 'title' && !view.hiddenProperties.includes(p.id))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => (
        <Card
          key={item.id}
          onClick={() => onItemClick(item)}
          className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
        >
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Image className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium truncate">
              {item.properties[titleProperty?.id || ''] || 'Untitled'}
            </h4>
            <div className="mt-2 space-y-1">
              {visibleProperties.map(prop => {
                const value = item.properties[prop.id];
                if (!value) return null;
                return (
                  <div key={prop.id} className="text-xs text-muted-foreground truncate">
                    <span className="font-medium">{prop.name}:</span> {String(value)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card
        onClick={onAddItem}
        className="cursor-pointer hover:shadow-lg transition-shadow border-dashed flex items-center justify-center min-h-[200px]"
      >
        <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
          <Plus className="w-8 h-8" />
          <span>Add new</span>
        </CardContent>
      </Card>
    </div>
  );
};
