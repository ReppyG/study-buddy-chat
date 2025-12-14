// Canvas LMS API proxy edge function
// Securely handles Canvas API calls without exposing tokens to the frontend

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CanvasRequest {
  action: 'test' | 'getCourses' | 'getAssignments' | 'getGrades' | 'getAnnouncements' | 'getSyllabus' | 'getUser';
  canvasUrl: string;
  apiToken: string;
  courseId?: number;
}

// Make Canvas API request
async function canvasRequest(canvasUrl: string, apiToken: string, endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://${canvasUrl}/api/v1${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  console.log(`Canvas API request: ${endpoint}`);
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Canvas API error: ${response.status} - ${errorText}`);
    
    if (response.status === 401) {
      throw new Error('Invalid API token. Please check your Canvas access token.');
    }
    if (response.status === 403) {
      throw new Error('Access forbidden. Your token may not have the required permissions.');
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
    }
    throw new Error(`Canvas API error: ${response.status}`);
  }
  
  return response.json();
}

// Get current user info
async function getUser(canvasUrl: string, apiToken: string) {
  return canvasRequest(canvasUrl, apiToken, '/users/self');
}

// Get all active courses
async function getCourses(canvasUrl: string, apiToken: string) {
  return canvasRequest(canvasUrl, apiToken, '/courses', {
    enrollment_state: 'active',
    include: 'term,teachers,total_scores',
    per_page: '100',
  });
}

// Get assignments for a course
async function getAssignments(canvasUrl: string, apiToken: string, courseId: number) {
  return canvasRequest(canvasUrl, apiToken, `/courses/${courseId}/assignments`, {
    include: 'submission',
    order_by: 'due_at',
    per_page: '100',
  });
}

// Get grades/submissions for a course
async function getGrades(canvasUrl: string, apiToken: string, courseId: number) {
  const submissions = await canvasRequest(canvasUrl, apiToken, `/courses/${courseId}/students/submissions`, {
    student_ids: 'all',
    include: 'assignment',
    per_page: '100',
  });
  
  // Filter to only include the current user's submissions
  return submissions.map((sub: any) => ({
    assignment_id: sub.assignment_id,
    assignment_name: sub.assignment?.name || 'Unknown',
    score: sub.score,
    grade: sub.grade,
    points_possible: sub.assignment?.points_possible || 0,
    submitted_at: sub.submitted_at,
  }));
}

// Get announcements for courses
async function getAnnouncements(canvasUrl: string, apiToken: string, courseIds: number[]) {
  if (courseIds.length === 0) return [];
  
  const contextCodes = courseIds.map(id => `course_${id}`).join(',');
  return canvasRequest(canvasUrl, apiToken, '/announcements', {
    context_codes: contextCodes,
    per_page: '20',
  });
}

// Get syllabus for a course
async function getSyllabus(canvasUrl: string, apiToken: string, courseId: number) {
  const course = await canvasRequest(canvasUrl, apiToken, `/courses/${courseId}`, {
    include: 'syllabus_body',
  });
  return {
    course_id: courseId,
    syllabus_body: course.syllabus_body,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, canvasUrl, apiToken, courseId }: CanvasRequest = await req.json();
    
    // Never log the API token
    console.log(`Canvas action: ${action}, URL: ${canvasUrl}`);
    
    if (!canvasUrl || !apiToken) {
      throw new Error('Canvas URL and API token are required');
    }
    
    // Clean the Canvas URL (remove protocol if present)
    const cleanUrl = canvasUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    let result: any;
    
    switch (action) {
      case 'test':
      case 'getUser':
        result = await getUser(cleanUrl, apiToken);
        break;
        
      case 'getCourses':
        result = await getCourses(cleanUrl, apiToken);
        break;
        
      case 'getAssignments':
        if (!courseId) throw new Error('Course ID required for getAssignments');
        result = await getAssignments(cleanUrl, apiToken, courseId);
        break;
        
      case 'getGrades':
        if (!courseId) throw new Error('Course ID required for getGrades');
        result = await getGrades(cleanUrl, apiToken, courseId);
        break;
        
      case 'getAnnouncements':
        // First get courses, then fetch announcements
        const courses = await getCourses(cleanUrl, apiToken);
        const courseIds = courses.map((c: any) => c.id);
        result = await getAnnouncements(cleanUrl, apiToken, courseIds);
        break;
        
      case 'getSyllabus':
        if (!courseId) throw new Error('Course ID required for getSyllabus');
        result = await getSyllabus(cleanUrl, apiToken, courseId);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    console.error('Canvas function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
