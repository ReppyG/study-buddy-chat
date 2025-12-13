/*
  DATE UTILITY FUNCTIONS
  ======================
  Helper functions for working with assignment due dates
*/

import { formatDistanceToNow, differenceInDays, differenceInHours, format, isToday, isTomorrow, isPast } from 'date-fns';

export interface DueDateInfo {
  text: string;
  urgency: 'overdue' | 'urgent' | 'soon' | 'normal';
  color: string;
}

export function getDueDateInfo(dueDate: string, dueTime: string): DueDateInfo {
  const dueDateObj = new Date(`${dueDate}T${dueTime}`);
  const now = new Date();
  
  // Check if overdue
  if (isPast(dueDateObj)) {
    return {
      text: 'Overdue',
      urgency: 'overdue',
      color: 'text-destructive',
    };
  }

  const hoursUntilDue = differenceInHours(dueDateObj, now);
  const daysUntilDue = differenceInDays(dueDateObj, now);

  // Less than 24 hours
  if (hoursUntilDue < 24) {
    if (isToday(dueDateObj)) {
      return {
        text: `Due today at ${format(dueDateObj, 'h:mm a')}`,
        urgency: 'urgent',
        color: 'text-destructive',
      };
    }
    return {
      text: `Due in ${hoursUntilDue} hours`,
      urgency: 'urgent',
      color: 'text-destructive',
    };
  }

  // Tomorrow
  if (isTomorrow(dueDateObj)) {
    return {
      text: `Due tomorrow at ${format(dueDateObj, 'h:mm a')}`,
      urgency: 'urgent',
      color: 'text-destructive',
    };
  }

  // 2-3 days
  if (daysUntilDue <= 3) {
    return {
      text: `Due in ${daysUntilDue} days`,
      urgency: 'soon',
      color: 'text-[hsl(var(--timer-paused))]',
    };
  }

  // More than 3 days
  return {
    text: `Due ${format(dueDateObj, 'MMM d')}`,
    urgency: 'normal',
    color: 'text-muted-foreground',
  };
}

export function formatDueDate(dueDate: string, dueTime: string): string {
  const dueDateObj = new Date(`${dueDate}T${dueTime}`);
  return format(dueDateObj, 'MMM d, yyyy \'at\' h:mm a');
}

export function isWithinDays(dueDate: string, days: number): boolean {
  const dueDateObj = new Date(dueDate);
  const now = new Date();
  const diffDays = differenceInDays(dueDateObj, now);
  return diffDays >= 0 && diffDays <= days;
}
