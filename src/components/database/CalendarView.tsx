import React, { useState } from 'react';
import { Database, DatabaseView, DatabaseItem } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  database: Database;
  view: DatabaseView;
  items: DatabaseItem[];
  onItemClick: (item: DatabaseItem) => void;
  onAddItem: (defaultProperties?: Record<string, any>) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  database,
  view,
  items,
  onItemClick,
  onAddItem,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateProperty = database.properties.find(p => p.type === 'date');
  const titleProperty = database.properties.find(p => p.type === 'title');

  if (!dateProperty) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Add a date property to use calendar view</p>
      </div>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start with days from previous month
  const startDayOfWeek = monthStart.getDay();
  const paddedDays: (Date | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...days,
  ];

  // Pad the end to make a complete grid
  const totalCells = Math.ceil(paddedDays.length / 7) * 7;
  while (paddedDays.length < totalCells) {
    paddedDays.push(null);
  }

  const getItemsForDay = (day: Date) => {
    return items.filter(item => {
      const itemDate = item.properties[dateProperty.id];
      return itemDate && isSameDay(new Date(itemDate), day);
    });
  };

  const handleDayClick = (day: Date) => {
    onAddItem({ [dateProperty.id]: day.toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="bg-background/50 min-h-[100px]" />;
          }

          const dayItems = getItemsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                'bg-background min-h-[100px] p-1 group relative',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full',
                  isCurrentDay && 'bg-primary text-primary-foreground'
                )}>
                  {format(day, 'd')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDayClick(day)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                {dayItems.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="text-xs p-1 bg-primary/20 text-primary rounded truncate cursor-pointer hover:bg-primary/30"
                  >
                    {item.properties[titleProperty?.id || ''] || 'Untitled'}
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
