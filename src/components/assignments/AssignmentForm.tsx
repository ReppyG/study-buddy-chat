/*
  ASSIGNMENT FORM COMPONENT
  =========================
  Modal form for adding/editing assignments
*/

import { useState, useEffect } from 'react';
import { Assignment, Course, Priority, Status, RecurringType } from '@/types/assignment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignmentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Assignment>) => void;
  editingAssignment?: Assignment | null;
  courses: Course[];
}

const defaultFormState = {
  title: '',
  courseId: '',
  dueDate: new Date().toISOString().split('T')[0],
  dueTime: '23:59',
  priority: 'medium' as Priority,
  status: 'not-started' as Status,
  points: '',
  description: '',
  recurring: 'none' as RecurringType,
};

export function AssignmentForm({
  open,
  onClose,
  onSave,
  onUpdate,
  editingAssignment,
  courses,
}: AssignmentFormProps) {
  const [form, setForm] = useState(defaultFormState);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingAssignment) {
      setForm({
        title: editingAssignment.title,
        courseId: editingAssignment.courseId,
        dueDate: editingAssignment.dueDate,
        dueTime: editingAssignment.dueTime,
        priority: editingAssignment.priority,
        status: editingAssignment.status,
        points: editingAssignment.points?.toString() || '',
        description: editingAssignment.description,
        recurring: editingAssignment.recurring,
      });
    } else {
      setForm(defaultFormState);
    }
  }, [editingAssignment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.courseId) {
      return;
    }

    const assignmentData = {
      title: form.title.trim(),
      courseId: form.courseId,
      dueDate: form.dueDate,
      dueTime: form.dueTime,
      priority: form.priority,
      status: form.status,
      points: form.points ? parseInt(form.points) : null,
      description: form.description.trim(),
      recurring: form.recurring,
    };

    if (editingAssignment && onUpdate) {
      onUpdate(editingAssignment.id, assignmentData);
    } else {
      onSave(assignmentData);
    }

    onClose();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setForm(prev => ({ ...prev, dueDate: date.toISOString().split('T')[0] }));
      setDatePickerOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Chapter 5 Problem Set"
              className="bg-input"
              required
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label>Course *</Label>
            <Select
              value={form.courseId}
              onValueChange={value => setForm(prev => ({ ...prev, courseId: value }))}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${course.color}`} />
                      {course.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input",
                      !form.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dueDate ? format(new Date(form.dueDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(form.dueDate)}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={form.dueTime}
                onChange={e => setForm(prev => ({ ...prev, dueTime: e.target.value }))}
                className="bg-input"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value: Priority) => setForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value: Status) => setForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Points & Recurring */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="points">Points (optional)</Label>
              <Input
                id="points"
                type="number"
                value={form.points}
                onChange={e => setForm(prev => ({ ...prev, points: e.target.value }))}
                placeholder="e.g., 100"
                className="bg-input"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Recurring</Label>
              <Select
                value={form.recurring}
                onValueChange={(value: RecurringType) => setForm(prev => ({ ...prev, recurring: value }))}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add notes, links, or details..."
              className="bg-input min-h-[80px]"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gradient-bg hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" />
              {editingAssignment ? 'Save Changes' : 'Add Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
