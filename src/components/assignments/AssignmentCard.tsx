/*
  ASSIGNMENT CARD COMPONENT
  =========================
  Displays a single assignment with all its details and quick actions
*/

import { Assignment, Course, Priority, Status } from '@/types/assignment';
import { getDueDateInfo, formatDueDate } from '@/lib/dateUtils';
import { 
  Check, 
  Clock, 
  Trash2, 
  AlarmClock, 
  Edit2, 
  GripVertical,
  AlertCircle,
  Circle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AssignmentCardProps {
  assignment: Assignment;
  course: Course | undefined;
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
  isDragging?: boolean;
}

// Priority badge styles
const priorityStyles: Record<Priority, string> = {
  high: 'bg-destructive/20 text-destructive border-destructive/30',
  medium: 'bg-[hsl(var(--timer-paused))]/20 text-[hsl(var(--timer-paused))] border-[hsl(var(--timer-paused))]/30',
  low: 'bg-muted text-muted-foreground border-border',
};

// Status styles
const statusStyles: Record<Status, { bg: string; text: string; icon: React.ReactNode }> = {
  'not-started': {
    bg: 'bg-muted',
    text: 'Not Started',
    icon: <Circle className="w-3 h-3" />,
  },
  'in-progress': {
    bg: 'bg-primary/20',
    text: 'In Progress',
    icon: <Clock className="w-3 h-3" />,
  },
  'completed': {
    bg: 'bg-[hsl(var(--timer-active))]/20',
    text: 'Completed',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export function AssignmentCard({
  assignment,
  course,
  onToggleComplete,
  onSnooze,
  onDelete,
  onEdit,
  isDragging,
}: AssignmentCardProps) {
  const dueDateInfo = getDueDateInfo(assignment.dueDate, assignment.dueTime);
  const isCompleted = assignment.status === 'completed';
  const statusStyle = statusStyles[assignment.status];

  return (
    <div
      className={`
        group relative bg-card border border-border rounded-xl p-4
        transition-all duration-200 hover:border-primary/30 hover:shadow-lg
        ${isDragging ? 'shadow-xl rotate-2 scale-105' : ''}
        ${isCompleted ? 'opacity-60' : ''}
      `}
    >
      {/* Drag handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="pl-4">
        {/* Top row: Course tag + Priority + Status */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Course badge */}
          {course && (
            <Badge 
              variant="outline" 
              className={`${course.color} text-white border-0 text-xs`}
            >
              {course.name}
            </Badge>
          )}

          {/* Priority badge */}
          <Badge 
            variant="outline" 
            className={`text-xs ${priorityStyles[assignment.priority]}`}
          >
            {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
          </Badge>

          {/* Status badge */}
          <Badge 
            variant="outline" 
            className={`text-xs ${statusStyle.bg} gap-1`}
          >
            {statusStyle.icon}
            {statusStyle.text}
          </Badge>

          {/* Points */}
          {assignment.points && (
            <span className="text-xs text-muted-foreground ml-auto">
              {assignment.points} pts
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-lg mb-1 ${isCompleted ? 'line-through' : ''}`}>
          {assignment.title}
        </h3>

        {/* Due date with urgency indicator */}
        <div className={`flex items-center gap-2 text-sm mb-2 ${dueDateInfo.color}`}>
          {dueDateInfo.urgency === 'overdue' || dueDateInfo.urgency === 'urgent' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span className="font-medium">{dueDateInfo.text}</span>
          <span className="text-muted-foreground text-xs">
            ({formatDueDate(assignment.dueDate, assignment.dueTime)})
          </span>
        </div>

        {/* Description preview */}
        {assignment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {assignment.description}
          </p>
        )}

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isCompleted ? 'outline' : 'default'}
            onClick={() => onToggleComplete(assignment.id)}
            className={isCompleted ? '' : 'gradient-bg hover:opacity-90'}
          >
            <Check className="w-4 h-4 mr-1" />
            {isCompleted ? 'Undo' : 'Complete'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onSnooze(assignment.id)}
          >
            <AlarmClock className="w-4 h-4 mr-1" />
            +1 Day
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(assignment)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(assignment.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Urgency indicator stripe */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
          dueDateInfo.urgency === 'overdue' || dueDateInfo.urgency === 'urgent'
            ? 'bg-destructive'
            : dueDateInfo.urgency === 'soon'
            ? 'bg-[hsl(var(--timer-paused))]'
            : 'bg-primary'
        }`}
      />
    </div>
  );
}
