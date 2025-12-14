// Canvas LMS integration hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  saveConnection, 
  getConnection, 
  clearConnection, 
  saveCanvasData, 
  getCanvasData 
} from '@/lib/canvasStorage';
import type { 
  CanvasConnection, 
  CanvasData, 
  CanvasCourse, 
  CanvasAssignment, 
  CanvasAnnouncement,
  ConnectionStatus,
  CanvasSyncState
} from '@/types/canvas';

// Test mode fake data for development
const FAKE_COURSES: CanvasCourse[] = [
  { id: 1, name: 'AP Calculus BC', course_code: 'CALC-BC', term: { name: 'Fall 2024' }, teachers: [{ display_name: 'Mrs. Johnson' }] },
  { id: 2, name: 'AP English Literature', course_code: 'ENG-LIT', term: { name: 'Fall 2024' }, teachers: [{ display_name: 'Mr. Smith' }] },
  { id: 3, name: 'AP Physics C', course_code: 'PHYS-C', term: { name: 'Fall 2024' }, teachers: [{ display_name: 'Dr. Williams' }] },
  { id: 4, name: 'US History', course_code: 'HIST-US', term: { name: 'Fall 2024' }, teachers: [{ display_name: 'Ms. Davis' }] },
];

const FAKE_ASSIGNMENTS: Record<number, CanvasAssignment[]> = {
  1: [
    { id: 101, name: 'Integration Practice Set', description: 'Complete problems 1-20', due_at: new Date(Date.now() + 86400000 * 2).toISOString(), points_possible: 50, submission_types: ['online_upload'], locked_for_user: false, course_id: 1, html_url: '#' },
    { id: 102, name: 'Derivatives Quiz', description: null, due_at: new Date(Date.now() + 86400000 * 5).toISOString(), points_possible: 100, submission_types: ['online_quiz'], locked_for_user: false, course_id: 1, html_url: '#' },
  ],
  2: [
    { id: 201, name: 'Essay: Theme Analysis', description: 'Analyze the theme of isolation in the novel', due_at: new Date(Date.now() + 86400000 * 3).toISOString(), points_possible: 100, submission_types: ['online_text_entry'], locked_for_user: false, course_id: 2, html_url: '#' },
  ],
  3: [
    { id: 301, name: 'Lab Report: Momentum', description: 'Write up results from momentum experiment', due_at: new Date(Date.now() + 86400000).toISOString(), points_possible: 75, submission_types: ['online_upload'], locked_for_user: false, course_id: 3, html_url: '#' },
  ],
  4: [
    { id: 401, name: 'Chapter 5 Reading Notes', description: 'Complete Cornell notes for chapter 5', due_at: new Date(Date.now() + 86400000 * 4).toISOString(), points_possible: 25, submission_types: ['online_text_entry'], locked_for_user: false, course_id: 4, html_url: '#' },
  ],
};

const FAKE_ANNOUNCEMENTS: CanvasAnnouncement[] = [
  { id: 1, title: 'Test Postponed', message: 'The unit test has been moved to next Friday.', posted_at: new Date().toISOString(), author: { display_name: 'Mrs. Johnson' }, context_code: 'course_1' },
  { id: 2, title: 'Office Hours Update', message: 'I will have extra office hours this week before the essay is due.', posted_at: new Date(Date.now() - 86400000).toISOString(), author: { display_name: 'Mr. Smith' }, context_code: 'course_2' },
];

const AUTO_SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function useCanvas() {
  const [connection, setConnection] = useState<CanvasConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [testMode, setTestMode] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [syncState, setSyncState] = useState<CanvasSyncState>({
    lastSync: null,
    isSyncing: false,
    syncProgress: 0,
    error: null,
  });
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved connection on mount
  useEffect(() => {
    const saved = getConnection();
    if (saved) {
      setConnection(saved);
      setConnectionStatus('connected');
    }
    
    const savedData = getCanvasData();
    if (savedData) {
      setCanvasData(savedData);
      setSyncState(savedData.syncState);
    }
  }, []);

  // Set up auto-sync
  useEffect(() => {
    if (connectionStatus === 'connected' && !testMode) {
      syncIntervalRef.current = setInterval(() => {
        syncAllData();
      }, AUTO_SYNC_INTERVAL);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [connectionStatus, testMode]);

  // Canvas API call helper
  const callCanvasApi = useCallback(async (action: string, courseId?: number) => {
    if (!connection) throw new Error('Not connected to Canvas');
    
    const { data, error } = await supabase.functions.invoke('canvas', {
      body: {
        action,
        canvasUrl: connection.canvasUrl,
        apiToken: connection.apiToken,
        courseId,
      },
    });
    
    if (error) throw error;
    if (!data.success) throw new Error(data.error);
    
    return data.data;
  }, [connection]);

  // Test connection
  const testConnection = useCallback(async (canvasUrl: string, apiToken: string): Promise<{ success: boolean; user?: any; error?: string }> => {
    setConnectionStatus('testing');
    
    // Test mode check
    if (canvasUrl === 'test.instructure.com' && apiToken === 'test') {
      setTestMode(true);
      setConnectionStatus('connected');
      return { success: true, user: { name: 'Test Student', id: 12345 } };
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('canvas', {
        body: {
          action: 'test',
          canvasUrl,
          apiToken,
        },
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      setConnectionStatus('connected');
      return { success: true, user: data.data };
    } catch (err: any) {
      setConnectionStatus('error');
      return { success: false, error: err.message };
    }
  }, []);

  // Connect to Canvas
  const connect = useCallback(async (canvasUrl: string, apiToken: string) => {
    const result = await testConnection(canvasUrl, apiToken);
    
    if (result.success) {
      const newConnection: CanvasConnection = {
        canvasUrl,
        apiToken,
        userId: result.user?.id?.toString(),
        userName: result.user?.name,
        connectedAt: new Date().toISOString(),
      };
      
      setConnection(newConnection);
      saveConnection(newConnection);
      
      // Initial sync
      if (!testMode) {
        await syncAllData();
      } else {
        // Load fake data for test mode
        const fakeData: Omit<CanvasData, 'expiresAt'> = {
          courses: FAKE_COURSES,
          assignments: FAKE_ASSIGNMENTS,
          grades: {},
          announcements: FAKE_ANNOUNCEMENTS,
          syncState: { lastSync: new Date().toISOString(), isSyncing: false, syncProgress: 100, error: null },
        };
        setCanvasData(fakeData as CanvasData);
        setSyncState(fakeData.syncState);
      }
    }
    
    return result;
  }, [testConnection, testMode]);

  // Disconnect
  const disconnect = useCallback(() => {
    clearConnection();
    setConnection(null);
    setCanvasData(null);
    setConnectionStatus('disconnected');
    setTestMode(false);
    setSyncState({ lastSync: null, isSyncing: false, syncProgress: 0, error: null });
  }, []);

  // Sync all data from Canvas
  const syncAllData = useCallback(async () => {
    if (!connection || testMode) {
      if (testMode) {
        // Refresh fake data
        const fakeData: Omit<CanvasData, 'expiresAt'> = {
          courses: FAKE_COURSES,
          assignments: FAKE_ASSIGNMENTS,
          grades: {},
          announcements: FAKE_ANNOUNCEMENTS,
          syncState: { lastSync: new Date().toISOString(), isSyncing: false, syncProgress: 100, error: null },
        };
        setCanvasData(fakeData as CanvasData);
        setSyncState(fakeData.syncState);
      }
      return;
    }
    
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null, syncProgress: 0 }));
    
    try {
      // Fetch courses (20% progress)
      setSyncState(prev => ({ ...prev, syncProgress: 10 }));
      const courses = await callCanvasApi('getCourses');
      setSyncState(prev => ({ ...prev, syncProgress: 20 }));
      
      // Fetch assignments for each course (20-70% progress)
      const assignments: Record<number, CanvasAssignment[]> = {};
      const progressPerCourse = 50 / Math.max(courses.length, 1);
      
      for (let i = 0; i < courses.length; i++) {
        try {
          const courseAssignments = await callCanvasApi('getAssignments', courses[i].id);
          assignments[courses[i].id] = courseAssignments;
        } catch (err) {
          console.error(`Failed to fetch assignments for course ${courses[i].id}:`, err);
          assignments[courses[i].id] = [];
        }
        setSyncState(prev => ({ ...prev, syncProgress: 20 + (i + 1) * progressPerCourse }));
      }
      
      // Fetch announcements (70-90% progress)
      setSyncState(prev => ({ ...prev, syncProgress: 70 }));
      let announcements: CanvasAnnouncement[] = [];
      try {
        announcements = await callCanvasApi('getAnnouncements');
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
      setSyncState(prev => ({ ...prev, syncProgress: 90 }));
      
      // Save data
      const newSyncState: CanvasSyncState = {
        lastSync: new Date().toISOString(),
        isSyncing: false,
        syncProgress: 100,
        error: null,
      };
      
      const newData: Omit<CanvasData, 'expiresAt'> = {
        courses,
        assignments,
        grades: {},
        announcements,
        syncState: newSyncState,
      };
      
      saveCanvasData(newData);
      setCanvasData(newData as CanvasData);
      setSyncState(newSyncState);
      
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Sync failed',
      }));
    }
  }, [connection, testMode, callCanvasApi]);

  // Get assignments formatted for the assignment tracker
  const getAssignmentsForTracker = useCallback(() => {
    if (!canvasData) return [];
    
    const allAssignments: CanvasAssignment[] = [];
    Object.values(canvasData.assignments).forEach(courseAssignments => {
      allAssignments.push(...courseAssignments);
    });
    
    return allAssignments;
  }, [canvasData]);

  return {
    // Connection state
    connection,
    connectionStatus,
    testMode,
    
    // Connection actions
    testConnection,
    connect,
    disconnect,
    
    // Data
    canvasData,
    syncState,
    
    // Sync actions
    syncAllData,
    
    // Helpers
    getAssignmentsForTracker,
    callCanvasApi,
  };
}
