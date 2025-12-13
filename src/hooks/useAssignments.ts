/*
  ASSIGNMENTS STORAGE HOOK
  ========================
  Handles CRUD operations and localStorage persistence for assignments
*/

import { useState, useEffect, useCallback } from 'react';
import { Assignment, Course, SAMPLE_ASSIGNMENTS, SAMPLE_COURSES } from '@/types/assignment';

const ASSIGNMENTS_KEY = 'study-buddy-assignments';
const COURSES_KEY = 'study-buddy-courses';

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedAssignments = localStorage.getItem(ASSIGNMENTS_KEY);
    const storedCourses = localStorage.getItem(COURSES_KEY);

    if (storedAssignments) {
      setAssignments(JSON.parse(storedAssignments));
    } else {
      // Use sample data for first-time users
      setAssignments(SAMPLE_ASSIGNMENTS);
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(SAMPLE_ASSIGNMENTS));
    }

    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    } else {
      setCourses(SAMPLE_COURSES);
      localStorage.setItem(COURSES_KEY, JSON.stringify(SAMPLE_COURSES));
    }

    setIsLoaded(true);
  }, []);

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    }
  }, [assignments, isLoaded]);

  // Save courses to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    }
  }, [courses, isLoaded]);

  // Add a new assignment
  const addAssignment = useCallback((assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  }, []);

  // Update an existing assignment
  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    setAssignments(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, ...updates, updatedAt: new Date().toISOString() }
          : a
      )
    );
  }, []);

  // Delete an assignment
  const deleteAssignment = useCallback((id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Mark assignment complete/incomplete
  const toggleComplete = useCallback((id: string) => {
    setAssignments(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'completed' ? 'not-started' : 'completed',
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
  }, []);

  // Snooze assignment (add 1 day to due date)
  const snoozeAssignment = useCallback((id: string) => {
    setAssignments(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        const currentDate = new Date(a.dueDate);
        currentDate.setDate(currentDate.getDate() + 1);
        return {
          ...a,
          dueDate: currentDate.toISOString().split('T')[0],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Reorder assignments (for drag and drop)
  const reorderAssignments = useCallback((newOrder: Assignment[]) => {
    setAssignments(newOrder);
  }, []);

  // Get course by ID
  const getCourse = useCallback(
    (courseId: string) => courses.find(c => c.id === courseId),
    [courses]
  );

  return {
    assignments,
    courses,
    isLoaded,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleComplete,
    snoozeAssignment,
    reorderAssignments,
    getCourse,
  };
}
