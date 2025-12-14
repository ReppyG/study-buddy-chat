// Canvas LMS integration types

export interface CanvasConnection {
  canvasUrl: string;
  apiToken: string;
  userId?: string;
  userName?: string;
  connectedAt?: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  term?: {
    name: string;
  };
  teachers?: Array<{
    display_name: string;
  }>;
  enrollments?: Array<{
    type: string;
    computed_current_score?: number;
    computed_current_grade?: string;
  }>;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;
  points_possible: number | null;
  submission_types: string[];
  locked_for_user: boolean;
  course_id: number;
  html_url: string;
}

export interface CanvasGrade {
  assignment_id: number;
  assignment_name: string;
  score: number | null;
  grade: string | null;
  points_possible: number;
  submitted_at: string | null;
}

export interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  author: {
    display_name: string;
  };
  context_code: string;
}

export interface CanvasSyllabus {
  course_id: number;
  syllabus_body: string | null;
}

export interface CanvasSyncState {
  lastSync: string | null;
  isSyncing: boolean;
  syncProgress: number;
  error: string | null;
}

export type ConnectionStatus = 'disconnected' | 'testing' | 'connected' | 'error';

export interface CanvasData {
  courses: CanvasCourse[];
  assignments: Record<number, CanvasAssignment[]>;
  grades: Record<number, CanvasGrade[]>;
  announcements: CanvasAnnouncement[];
  syncState: CanvasSyncState;
  expiresAt: string;
}
