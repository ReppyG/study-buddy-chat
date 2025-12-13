/*
  CALENDAR VIEW COMPONENT
  =======================
  Monthly calendar showing assignments by due date
*/

import { useState } from 'react';
import { Assignment, Course } from '@/types/assignment';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  assignments: Assignment[];
  getCourse: (id: string) => Course | undefined;
  onEdit: (assignment: Assignment) => void;
}

export function CalendarView({ assignments, getCourse, onEdit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all days to display (including padding from prev/next month)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get assignments for a specific day
  const getAssignmentsForDay = (day: Date) => {
    return assignments.filter(a => isSameDay(new Date(a.dueDate), day));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-secondary/30 rounded-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayAssignments = getAssignmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[80px] p-1 rounded-lg border transition-colors
                ${isCurrentMonth ? 'bg-card border-border' : 'bg-muted/30 border-transparent'}
                ${isCurrentDay ? 'ring-2 ring-primary' : ''}
              `}
            >
              {/* Day number */}
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isCurrentDay ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>

              {/* Assignment badges */}
              <div className="space-y-0.5">
                {dayAssignments.slice(0, 2).map(assignment => {
                  const course = getCourse(assignment.courseId);
                  return (
                    <button
                      key={assignment.id}
                      onClick={() => onEdit(assignment)}
                      className={`
                        w-full text-left text-[10px] px-1 py-0.5 rounded truncate
                        ${course?.color || 'bg-primary'} text-white
                        hover:opacity-80 transition-opacity
                        ${assignment.status === 'completed' ? 'opacity-50 line-through' : ''}
                      `}
                    >
                      {assignment.title}
                    </button>
                  );
                })}
                {dayAssignments.length > 2 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    +{dayAssignments.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
