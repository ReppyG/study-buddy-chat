import React from 'react';
import { Database, DatabaseView, DatabaseItem, Property } from '@/types/database';
import { PropertyCell } from './PropertyCell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableViewProps {
  database: Database;
  view: DatabaseView;
  items: DatabaseItem[];
  onItemClick: (item: DatabaseItem) => void;
  onUpdateItem: (itemId: string, updates: Partial<DatabaseItem>) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onSort: (propertyId: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  database,
  view,
  items,
  onItemClick,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onSort,
}) => {
  const visibleProperties = database.properties.filter(
    p => !view.hiddenProperties.includes(p.id)
  );

  const getSortIcon = (propertyId: string) => {
    const sort = view.sorts.find(s => s.propertyId === propertyId);
    if (!sort) return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    return sort.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-8" />
            {visibleProperties.map(property => (
              <TableHead 
                key={property.id} 
                className="min-w-[150px] cursor-pointer hover:bg-accent/50"
                onClick={() => onSort(property.id)}
              >
                <div className="flex items-center gap-2">
                  <span>{property.name}</span>
                  {getSortIcon(property.id)}
                </div>
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow 
              key={item.id} 
              className="border-border group hover:bg-accent/30 cursor-pointer"
            >
              <TableCell className="w-8 p-2">
                <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
              </TableCell>
              {visibleProperties.map(property => (
                <TableCell 
                  key={property.id} 
                  className="p-2"
                  onClick={() => property.type === 'title' && onItemClick(item)}
                >
                  <PropertyCell
                    property={property}
                    value={item.properties[property.id]}
                    onChange={value => onUpdateItem(item.id, {
                      properties: { ...item.properties, [property.id]: value }
                    })}
                  />
                </TableCell>
              ))}
              <TableCell className="w-10 p-2">
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
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-border hover:bg-accent/30">
            <TableCell colSpan={visibleProperties.length + 2} className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddItem}
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
