// Individual course card component
import { TrendingUp, TrendingDown, Clock, Bell, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import type { CanvasCourse, CanvasAssignment, CanvasAnnouncement } from '@/types/canvas';

// Subject color mapping
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  math: { bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-500' },
  calc: { bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-500' },
  english: { bg: 'from-green-500/10 to-green-600/5', border: 'border-green-500/30', text: 'text-green-500' },
  lit: { bg: 'from-green-500/10 to-green-600/5', border: 'border-green-500/30', text: 'text-green-500' },
  science: { bg: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-500' },
  physics: { bg: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-500' },
  chemistry: { bg: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-500' },
  bio: { bg: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-500' },
  history: { bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-500' },
  social: { bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-500' },
  art: { bg: 'from-pink-500/10 to-pink-600/5', border: 'border-pink-500/30', text: 'text-pink-500' },
  music: { bg: 'from-pink-500/10 to-pink-600/5', border: 'border-pink-500/30', text: 'text-pink-500' },
  language: { bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-500' },
  spanish: { bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-500' },
  french: { bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-500' },
  default: { bg: 'from-primary/10 to-primary/5', border: 'border-primary/30', text: 'text-primary' },
};

function getSubjectColor(courseName: string) {
  const lowerName = courseName.toLowerCase();
  for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
    if (lowerName.includes(key)) return value;
  }
  return SUBJECT_COLORS.default;
}

interface CourseCardProps {
  course: CanvasCourse;
  assignments: CanvasAssignment[];
  announcements: CanvasAnnouncement[];
  onClick: () => void;
}

export function CourseCard({ course, assignments, announcements, onClick }: CourseCardProps) {
  const colors = getSubjectColor(course.name);
  
  // Get student enrollment for grade
  const enrollment = course.enrollments?.find(e => e.type === 'student');
  const currentScore = enrollment?.computed_current_score;
  const currentGrade = enrollment?.computed_current_grade;
  
  // Get next assignment
  const upcomingAssignments = assignments
    .filter(a => a.due_at && new Date(a.due_at) > new Date())
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());
  const nextAssignment = upcomingAssignments[0];
  
  // Count unread announcements (in a real app, would track read status)
  const unreadCount = announcements.filter(a => {
    const postedDate = new Date(a.posted_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return postedDate > dayAgo;
  }).length;

  // Mock grade trend (in a real app, would compare to previous)
  const gradeTrend = currentScore ? (currentScore > 85 ? 'up' : currentScore < 70 ? 'down' : 'stable') : 'stable';

  return (
    <Card 
      className={`bg-gradient-to-br ${colors.bg} ${colors.border} cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {course.name}
            </h3>
            <p className="text-xs text-muted-foreground">{course.course_code}</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {unreadCount}
            </Badge>
          )}
        </div>
        {course.teachers?.[0] && (
          <p className="text-sm text-muted-foreground mt-1">
            {course.teachers[0].display_name}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Grade Display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Grade</p>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${colors.text}`}>
                {currentScore ? `${currentScore.toFixed(0)}%` : 'N/A'}
              </span>
              {currentGrade && (
                <Badge variant="outline" className={colors.text}>
                  {currentGrade}
                </Badge>
              )}
              {gradeTrend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {gradeTrend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
            </div>
          </div>
        </div>

        {/* Next Assignment */}
        {nextAssignment ? (
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              Next Due
            </div>
            <p className="text-sm font-medium truncate">{nextAssignment.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(nextAssignment.due_at!), { addSuffix: true })}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <p className="text-sm text-muted-foreground">No upcoming assignments</p>
          </div>
        )}

        {/* View Course Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-background/50"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Course
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
