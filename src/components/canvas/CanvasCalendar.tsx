// Canvas calendar view with assignments
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas';

// Course color mapping
const COURSE_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-red-500',
  'bg-indigo-500',
];

interface CanvasCalendarProps {
  courses: CanvasCourse[];
  assignments: Record<number, CanvasAssignment[]>;
  onAssignmentClick?: (assignment: CanvasAssignment) => void;
}

export function CanvasCalendar({ courses, assignments, onAssignmentClick }: CanvasCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Create course color map
  const courseColors = useMemo(() => {
    const colorMap: Record<number, string> = {};
    courses.forEach((course, i) => {
      colorMap[course.id] = COURSE_COLORS[i % COURSE_COLORS.length];
    });
    return colorMap;
  }, [courses]);

  // Get all assignments flattened
  const allAssignments = useMemo(() => {
    return Object.values(assignments).flat();
  }, [assignments]);

  // Get assignments for a specific date
  const getAssignmentsForDate = (date: Date) => {
    return allAssignments.filter(a => {
      if (!a.due_at) return false;
      return isSameDay(new Date(a.due_at), date);
    });
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Get assignments for selected date
  const selectedDateAssignments = selectedDate ? getAssignmentsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Course Legend */}
      <div className="flex flex-wrap gap-2">
        {courses.map((course) => (
          <Badge 
            key={course.id} 
            variant="outline" 
            className="gap-1"
          >
            <div className={`h-2 w-2 rounded-full ${courseColors[course.id]}`} />
            {course.course_code}
          </Badge>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayAssignments = getAssignmentsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <Popover key={day.toISOString()}>
                  <PopoverTrigger asChild>
                    <button
                      className={`
                        min-h-[80px] p-2 rounded-lg border transition-all text-left
                        ${isCurrentMonth ? 'bg-card hover:bg-muted' : 'bg-muted/30 text-muted-foreground'}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                        ${today ? 'border-primary' : 'border-transparent'}
                      `}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`
                          text-sm font-medium
                          ${today ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''}
                        `}>
                          {format(day, 'd')}
                        </span>
                        {dayAssignments.length > 3 && (
                          <Badge variant="secondary" className="text-xs px-1">
                            +{dayAssignments.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Assignment dots */}
                      <div className="mt-1 space-y-1">
                        {dayAssignments.slice(0, 3).map((assignment) => {
                          const course = courses.find(c => c.id === assignment.course_id);
                          return (
                            <div 
                              key={assignment.id}
                              className={`text-xs truncate rounded px-1 py-0.5 text-white ${courseColors[assignment.course_id] || 'bg-gray-500'}`}
                            >
                              {assignment.name}
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  </PopoverTrigger>
                  
                  {dayAssignments.length > 0 && (
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-3 border-b">
                        <h4 className="font-medium">{format(day, 'EEEE, MMMM d')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dayAssignments.length} assignment{dayAssignments.length !== 1 ? 's' : ''} due
                        </p>
                      </div>
                      <ScrollArea className="max-h-[300px]">
                        <div className="p-2 space-y-2">
                          {dayAssignments.map((assignment) => {
                            const course = courses.find(c => c.id === assignment.course_id);
                            return (
                              <button
                                key={assignment.id}
                                className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => onAssignmentClick?.(assignment)}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 ${courseColors[assignment.course_id]}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{assignment.name}</p>
                                    <p className="text-xs text-muted-foreground">{course?.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {assignment.points_possible && (
                                        <Badge variant="outline" className="text-xs">
                                          {assignment.points_possible} pts
                                        </Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(assignment.due_at!), 'h:mm a')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  )}
                </Popover>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              {selectedDateAssignments.length > 0 && (
                <Badge variant="secondary">{selectedDateAssignments.length} due</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No assignments due on this date.</p>
            ) : (
              <div className="space-y-3">
                {selectedDateAssignments.map((assignment) => {
                  const course = courses.find(c => c.id === assignment.course_id);
                  return (
                    <div 
                      key={assignment.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => onAssignmentClick?.(assignment)}
                    >
                      <div className={`w-3 h-3 rounded-full ${courseColors[assignment.course_id]}`} />
                      <div className="flex-1">
                        <p className="font-medium">{assignment.name}</p>
                        <p className="text-sm text-muted-foreground">{course?.name}</p>
                      </div>
                      <div className="text-right">
                        {assignment.points_possible && (
                          <Badge variant="outline">{assignment.points_possible} pts</Badge>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(assignment.due_at!), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Drag Warning */}
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="py-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          <span>Note: This calendar is view-only. Changes here won't update Canvas.</span>
        </CardContent>
      </Card>
    </div>
  );
}
