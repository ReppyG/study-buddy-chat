/*
  ASSIGNMENT TRACKER COMPONENT
  ============================
  Main component that brings together all assignment tracking features
*/

import { useState, useMemo } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { Assignment, ViewType, SortType, FilterState } from '@/types/assignment';
import { isWithinDays } from '@/lib/dateUtils';
import { ViewTabs } from './ViewTabs';
import { FilterBar } from './FilterBar';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { BoardView } from './BoardView';
import { UrgentView } from './UrgentView';
import { AssignmentForm } from './AssignmentForm';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

export function AssignmentTracker() {
  // Data and state management
  const {
    assignments,
    courses,
    isLoaded,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleComplete,
    snoozeAssignment,
    getCourse,
  } = useAssignments();

  // View state
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [sortBy, setSortBy] = useState<SortType>('due-date');
  const [filters, setFilters] = useState<FilterState>({
    courseId: null,
    status: null,
    priority: null,
    searchQuery: '',
    hideCompleted: false,
  });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Count urgent assignments (due within 3 days, not completed)
  const urgentCount = useMemo(() => {
    return assignments.filter(
      a => a.status !== 'completed' && isWithinDays(a.dueDate, 3)
    ).length;
  }, [assignments]);

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let result = [...assignments];

    // Apply filters
    if (filters.courseId) {
      result = result.filter(a => a.courseId === filters.courseId);
    }
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(a => a.priority === filters.priority);
    }
    if (filters.hideCompleted) {
      result = result.filter(a => a.status !== 'completed');
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'due-date':
        result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'course':
        result.sort((a, b) => a.courseId.localeCompare(b.courseId));
        break;
      case 'date-added':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [assignments, filters, sortBy]);

  // Handlers
  const handleAddAssignment = (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    addAssignment(data);
    toast.success('Assignment added!');
  };

  const handleUpdateAssignment = (id: string, updates: Partial<Assignment>) => {
    updateAssignment(id, updates);
    toast.success('Assignment updated!');
  };

  const handleDelete = (id: string) => {
    deleteAssignment(id);
    toast.success('Assignment deleted');
  };

  const handleToggleComplete = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    toggleComplete(id);
    toast.success(
      assignment?.status === 'completed' ? 'Marked as incomplete' : 'Marked as complete! 🎉'
    );
  };

  const handleSnooze = (id: string) => {
    snoozeAssignment(id);
    toast.success('Due date extended by 1 day');
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Assignments</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {assignments.length} total
          </span>
        </div>

        <Button onClick={() => setShowForm(true)} className="gradient-bg hover:opacity-90 gap-2">
          <Plus className="w-4 h-4" />
          Add Assignment
        </Button>
      </div>

      {/* View tabs */}
      <ViewTabs
        activeView={activeView}
        onViewChange={setActiveView}
        urgentCount={urgentCount}
      />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        courses={courses}
      />

      {/* Current view */}
      <div className="min-h-[400px]">
        {activeView === 'list' && (
          <ListView
            assignments={filteredAssignments}
            getCourse={getCourse}
            onToggleComplete={handleToggleComplete}
            onSnooze={handleSnooze}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
        {activeView === 'calendar' && (
          <CalendarView
            assignments={filteredAssignments}
            getCourse={getCourse}
            onEdit={handleEdit}
          />
        )}
        {activeView === 'board' && (
          <BoardView
            assignments={filteredAssignments}
            getCourse={getCourse}
            onToggleComplete={handleToggleComplete}
            onSnooze={handleSnooze}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
        {activeView === 'urgent' && (
          <UrgentView
            assignments={assignments} // Use unfiltered for urgent view
            getCourse={getCourse}
            onToggleComplete={handleToggleComplete}
            onSnooze={handleSnooze}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Add/Edit form modal */}
      <AssignmentForm
        open={showForm}
        onClose={handleCloseForm}
        onSave={handleAddAssignment}
        onUpdate={handleUpdateAssignment}
        editingAssignment={editingAssignment}
        courses={courses}
      />
    </div>
  );
}
