/*
  ASSIGNMENT TYPES
  ================
  TypeScript definitions for the assignment tracker
*/

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'not-started' | 'in-progress' | 'completed';
export type RecurringType = 'none' | 'weekly' | 'biweekly';
export type ViewType = 'list' | 'calendar' | 'board' | 'urgent';
export type SortType = 'due-date' | 'priority' | 'course' | 'date-added';

export interface Course {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string; // ISO string
  dueTime: string; // HH:MM format
  priority: Priority;
  status: Status;
  points: number | null;
  description: string;
  recurring: RecurringType;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  courseId: string | null;
  status: Status | null;
  priority: Priority | null;
  searchQuery: string;
  hideCompleted: boolean;
}

// Sample courses with colors
export const SAMPLE_COURSES: Course[] = [
  { id: 'math', name: 'Algebra II', color: 'bg-blue-500' },
  { id: 'english', name: 'English Literature', color: 'bg-purple-500' },
  { id: 'science', name: 'Chemistry', color: 'bg-green-500' },
  { id: 'history', name: 'World History', color: 'bg-amber-500' },
  { id: 'art', name: 'Digital Art', color: 'bg-pink-500' },
  { id: 'cs', name: 'Computer Science', color: 'bg-cyan-500' },
];

// Sample assignments for testing
export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Chapter 5 Problem Set',
    courseId: 'math',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '23:59',
    priority: 'high',
    status: 'in-progress',
    points: 50,
    description: 'Complete problems 1-25 on page 142',
    recurring: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Essay: The Great Gatsby Analysis',
    courseId: 'english',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '23:59',
    priority: 'high',
    status: 'not-started',
    points: 100,
    description: '5-page analysis of symbolism in The Great Gatsby',
    recurring: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Lab Report: Titration Experiment',
    courseId: 'science',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '15:00',
    priority: 'medium',
    status: 'not-started',
    points: 75,
    description: 'Write up results from Tuesday\'s titration lab',
    recurring: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Read Chapter 12',
    courseId: 'history',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '08:00',
    priority: 'low',
    status: 'completed',
    points: null,
    description: 'Read about the Industrial Revolution',
    recurring: 'weekly',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Digital Portrait Project',
    courseId: 'art',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '23:59',
    priority: 'medium',
    status: 'in-progress',
    points: 150,
    description: 'Create a digital self-portrait using Procreate',
    recurring: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Python Coding Challenge',
    courseId: 'cs',
    dueDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueTime: '17:00',
    priority: 'high',
    status: 'in-progress',
    points: 25,
    description: 'Complete the sorting algorithm challenge',
    recurring: 'none',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
