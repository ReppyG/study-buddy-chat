/*
  LIST VIEW COMPONENT
  ===================
  Displays assignments in a vertical list
*/

import { Assignment, Course } from '@/types/assignment';
import { AssignmentCard } from './AssignmentCard';
import { ClipboardList } from 'lucide-react';

interface ListViewProps {
  assignments: Assignment[];
  getCourse: (id: string) => Course | undefined;
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}

export function ListView({
  assignments,
  getCourse,
  onToggleComplete,
  onSnooze,
  onDelete,
  onEdit,
}: ListViewProps) {
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No assignments found</h3>
        <p className="text-sm text-muted-foreground">
          Add a new assignment or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map(assignment => (
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
  );
}
