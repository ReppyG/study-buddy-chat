// Course detail page with tabs
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CourseAssignments } from './CourseAssignments';
import { CourseGrades } from './CourseGrades';
import { CourseAnnouncements } from './CourseAnnouncements';
import { CourseSyllabus } from './CourseSyllabus';
import type { CanvasCourse, CanvasAssignment, CanvasGrade, CanvasAnnouncement, CanvasSyllabus as CanvasSyllabusType } from '@/types/canvas';

interface CourseDetailProps {
  course: CanvasCourse;
  assignments: CanvasAssignment[];
  grades: CanvasGrade[];
  announcements: CanvasAnnouncement[];
  syllabus: CanvasSyllabusType | null;
  onBack: () => void;
  onAddToStudyPlan?: (assignment: CanvasAssignment) => void;
}

export function CourseDetail({ 
  course, 
  assignments, 
  grades, 
  announcements, 
  syllabus,
  onBack,
  onAddToStudyPlan 
}: CourseDetailProps) {
  // Get current grade
  const enrollment = course.enrollments?.find(e => e.type === 'student');
  const currentScore = enrollment?.computed_current_score;
  const currentGrade = enrollment?.computed_current_grade;

  // Count upcoming assignments
  const upcomingCount = assignments.filter(a => {
    if (!a.due_at) return false;
    return new Date(a.due_at) > new Date();
  }).length;

  // Count unread announcements
  const unreadCount = announcements.filter(a => {
    const postedDate = new Date(a.posted_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return postedDate > dayAgo;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-muted-foreground">
            <span>{course.course_code}</span>
            {course.term && (
              <>
                <span>•</span>
                <span>{course.term.name}</span>
              </>
            )}
            {course.teachers?.[0] && (
              <>
                <span>•</span>
                <span>{course.teachers[0].display_name}</span>
              </>
            )}
          </div>
        </div>
        {currentScore !== undefined && (
          <div className="text-right">
            <p className="text-3xl font-bold">{currentScore.toFixed(1)}%</p>
            {currentGrade && (
              <Badge variant="outline" className="mt-1">{currentGrade}</Badge>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments" className="relative">
            Assignments
            {upcomingCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 min-w-5 px-1 text-xs"
              >
                {upcomingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="announcements" className="relative">
            Announcements
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 min-w-5 px-1 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments">
          <CourseAssignments 
            assignments={assignments} 
            courseName={course.name}
            onAddToStudyPlan={onAddToStudyPlan}
          />
        </TabsContent>

        <TabsContent value="grades">
          <CourseGrades 
            course={course} 
            assignments={assignments}
            grades={grades}
          />
        </TabsContent>

        <TabsContent value="announcements">
          <CourseAnnouncements announcements={announcements} />
        </TabsContent>

        <TabsContent value="syllabus">
          <CourseSyllabus syllabus={syllabus} courseName={course.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
