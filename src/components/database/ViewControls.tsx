import React, { useState } from 'react';
import { Database, DatabaseView, ViewType, Property, ViewFilter, PROPERTY_COLORS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, SortAsc, Eye, Plus, Table, Kanban, CalendarDays, 
  LayoutGrid, List, X, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewControlsProps {
  database: Database;
  view: DatabaseView;
  views: DatabaseView[];
  onViewChange: (viewId: string) => void;
  onUpdateView: (updates: Partial<DatabaseView>) => void;
  onAddView: (type: ViewType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const VIEW_ICONS: Record<ViewType, React.ElementType> = {
  table: Table,
  board: Kanban,
  calendar: CalendarDays,
  gallery: LayoutGrid,
  list: List,
};

export const ViewControls: React.FC<ViewControlsProps> = ({
  database,
  view,
  views,
  onViewChange,
  onUpdateView,
  onAddView,
  searchQuery,
  onSearchChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const addFilter = () => {
    const firstProperty = database.properties[0];
    if (firstProperty) {
      onUpdateView({
        filters: [...view.filters, {
          propertyId: firstProperty.id,
          operator: 'contains',
          value: '',
        }],
      });
    }
  };

  const updateFilter = (index: number, updates: Partial<ViewFilter>) => {
    const newFilters = [...view.filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onUpdateView({ filters: newFilters });
  };

  const removeFilter = (index: number) => {
    onUpdateView({ filters: view.filters.filter((_, i) => i !== index) });
  };

  const toggleHiddenProperty = (propertyId: string) => {
    const hidden = view.hiddenProperties.includes(propertyId);
    onUpdateView({
      hiddenProperties: hidden
        ? view.hiddenProperties.filter(id => id !== propertyId)
        : [...view.hiddenProperties, propertyId],
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {views.map(v => {
            const Icon = VIEW_ICONS[v.type];
            return (
              <Button
                key={v.id}
                variant={v.id === view.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(v.id)}
                className="gap-1"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{v.name}</span>
              </Button>
            );
          })}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="start">
              <div className="space-y-1">
                {(['table', 'board', 'calendar', 'gallery', 'list'] as ViewType[]).map(type => {
                  const Icon = VIEW_ICONS[type];
                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onAddView(type)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {type.charAt(0).toUpperCase() + type.slice(1)} View
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-8 h-8 w-40"
          />
        </div>

        {/* Filter Button */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn(view.filters.length > 0 && 'text-primary')}>
              <Filter className="w-4 h-4 mr-1" />
              Filter
              {view.filters.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 rounded-full">
                  {view.filters.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 bg-popover border border-border z-50" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Filters</span>
                <Button variant="ghost" size="sm" onClick={addFilter}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add filter
                </Button>
              </div>
              
              {view.filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={filter.propertyId}
                    onValueChange={value => updateFilter(index, { propertyId: value })}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {database.properties.map(prop => (
                        <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filter.operator}
                    onValueChange={value => updateFilter(index, { operator: value as any })}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="equals">equals</SelectItem>
                      <SelectItem value="notEquals">not equals</SelectItem>
                      <SelectItem value="isEmpty">is empty</SelectItem>
                      <SelectItem value="isNotEmpty">is not empty</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    value={filter.value}
                    onChange={e => updateFilter(index, { value: e.target.value })}
                    className="h-8 flex-1"
                    placeholder="Value"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Properties Visibility */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Properties
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="end">
            <div className="space-y-2">
              {database.properties.map(prop => (
                <div key={prop.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={!view.hiddenProperties.includes(prop.id)}
                    onCheckedChange={() => toggleHiddenProperty(prop.id)}
                  />
                  <span className="text-sm">{prop.name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Group By (for Board view) */}
        {view.type === 'board' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Group by
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="end">
              <div className="space-y-1">
                {database.properties
                  .filter(p => p.type === 'select' || p.type === 'status')
                  .map(prop => (
                    <Button
                      key={prop.id}
                      variant={view.groupByPropertyId === prop.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onUpdateView({ groupByPropertyId: prop.id })}
                    >
                      {prop.name}
                    </Button>
                  ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};
