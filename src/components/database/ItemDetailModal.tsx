import React from 'react';
import { Database, DatabaseItem } from '@/types/database';
import { PropertyCell } from './PropertyCell';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: Database;
  item: DatabaseItem | null;
  onUpdateItem: (updates: Partial<DatabaseItem>) => void;
  onDeleteItem: () => void;
  onDuplicateItem: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  database,
  item,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
}) => {
  if (!item) return null;

  const titleProperty = database.properties.find(p => p.type === 'title');
  const title = item.properties[titleProperty?.id || ''] || 'Untitled';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span>{database.icon}</span>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {database.properties.map(property => (
            <div key={property.id} className="flex items-start gap-4">
              <div className="w-32 text-sm text-muted-foreground py-2 flex-shrink-0">
                {property.name}
              </div>
              <div className="flex-1">
                <PropertyCell
                  property={property}
                  value={item.properties[property.id]}
                  onChange={value => onUpdateItem({
                    properties: { ...item.properties, [property.id]: value }
                  })}
                />
              </div>
            </div>
          ))}

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {format(new Date(item.createdAt), 'PPpp')}</p>
            <p>Last edited: {format(new Date(item.updatedAt), 'PPpp')}</p>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicateItem}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDeleteItem();
                onClose();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
