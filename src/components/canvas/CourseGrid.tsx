// Grid of course cards
import { CourseCard } from './CourseCard';
import type { CanvasCourse, CanvasAssignment, CanvasAnnouncement } from '@/types/canvas';

interface CourseGridProps {
  courses: CanvasCourse[];
  assignments: Record<number, CanvasAssignment[]>;
  announcements: CanvasAnnouncement[];
  onCourseClick: (courseId: number) => void;
}

export function CourseGrid({ courses, assignments, announcements, onCourseClick }: CourseGridProps) {
  // Get announcements for a specific course
  const getAnnouncementsForCourse = (courseId: number) => {
    return announcements.filter(a => a.context_code === `course_${courseId}`);
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No courses found. Connect to Canvas to see your courses.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          assignments={assignments[course.id] || []}
          announcements={getAnnouncementsForCourse(course.id)}
          onClick={() => onCourseClick(course.id)}
        />
      ))}
    </div>
  );
}
