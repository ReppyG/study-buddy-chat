/*
  URGENT VIEW COMPONENT
  =====================
  Shows only assignments due within the next 3 days
*/

import { Assignment, Course } from '@/types/assignment';
import { AssignmentCard } from './AssignmentCard';
import { isWithinDays } from '@/lib/dateUtils';
import { AlertTriangle, PartyPopper } from 'lucide-react';

interface UrgentViewProps {
  assignments: Assignment[];
  getCourse: (id: string) => Course | undefined;
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}

export function UrgentView({
  assignments,
  getCourse,
  onToggleComplete,
  onSnooze,
  onDelete,
  onEdit,
}: UrgentViewProps) {
  // Filter to only assignments due within 3 days that aren't completed
  const urgentAssignments = assignments.filter(
    a => a.status !== 'completed' && isWithinDays(a.dueDate, 3)
  );

  // Sort by due date (most urgent first)
  const sortedAssignments = [...urgentAssignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  if (sortedAssignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PartyPopper className="w-12 h-12 text-[hsl(var(--timer-active))] mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">You're all caught up! 🎉</h3>
        <p className="text-sm text-muted-foreground">
          No urgent assignments due in the next 3 days
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div>
          <h3 className="font-medium text-foreground">
            {sortedAssignments.length} assignment{sortedAssignments.length > 1 ? 's' : ''} due soon!
          </h3>
          <p className="text-sm text-muted-foreground">
            These assignments are due within the next 3 days
          </p>
        </div>
      </div>

      {/* Assignment list */}
      <div className="space-y-3">
        {sortedAssignments.map(assignment => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            course={getCourse(assignment.courseId)}
            onToggleComplete={onToggleComplete}
            onSnooze={onSnooze}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
