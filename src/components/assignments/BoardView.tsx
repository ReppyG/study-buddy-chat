/*
  BOARD VIEW COMPONENT
  ====================
  Kanban-style columns by assignment status
*/

import { Assignment, Course, Status } from '@/types/assignment';
import { AssignmentCard } from './AssignmentCard';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface BoardViewProps {
  assignments: Assignment[];
  getCourse: (id: string) => Course | undefined;
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}

const columns: { status: Status; title: string; icon: React.ReactNode }[] = [
  { status: 'not-started', title: 'Not Started', icon: <Circle className="w-4 h-4" /> },
  { status: 'in-progress', title: 'In Progress', icon: <Clock className="w-4 h-4" /> },
  { status: 'completed', title: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export function BoardView({
  assignments,
  getCourse,
  onToggleComplete,
  onSnooze,
  onDelete,
  onEdit,
}: BoardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(column => {
        const columnAssignments = assignments.filter(a => a.status === column.status);
        
        return (
          <div
            key={column.status}
            className="bg-secondary/30 rounded-xl p-4 min-h-[300px]"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              {column.icon}
              <h3 className="font-semibold">{column.title}</h3>
              <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {columnAssignments.length}
              </span>
            </div>

            {/* Column content */}
            <div className="space-y-3">
              {columnAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No assignments
                </p>
              ) : (
                columnAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    course={getCourse(assignment.courseId)}
                    onToggleComplete={onToggleComplete}
                    onSnooze={onSnooze}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
