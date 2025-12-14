// Canvas overview statistics card
import { BookOpen, Calendar, Trophy, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, isToday, isTomorrow, differenceInDays } from 'date-fns';
import type { CanvasCourse, CanvasAssignment } from '@/types/canvas';

interface OverviewCardProps {
  courses: CanvasCourse[];
  assignments: Record<number, CanvasAssignment[]>;
}

export function OverviewCard({ courses, assignments }: OverviewCardProps) {
  const allAssignments = Object.values(assignments).flat();
  const now = new Date();
  
  // Calculate statistics
  const upcomingAssignments = allAssignments.filter(a => {
    if (!a.due_at) return false;
    const dueDate = new Date(a.due_at);
    const daysUntilDue = differenceInDays(dueDate, now);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  const dueToday = allAssignments.filter(a => {
    if (!a.due_at) return false;
    return isToday(new Date(a.due_at));
  });

  const nextDeadlines = allAssignments
    .filter(a => a.due_at && new Date(a.due_at) > now)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .slice(0, 3);

  // Calculate GPA (mock - would need real grade data)
  const calculateGPA = () => {
    let totalPoints = 0;
    let count = 0;
    courses.forEach(course => {
      const enrollment = course.enrollments?.find(e => e.type === 'student');
      if (enrollment?.computed_current_score) {
        totalPoints += enrollment.computed_current_score;
        count++;
      }
    });
    return count > 0 ? (totalPoints / count / 25).toFixed(2) : 'N/A';
  };

  const getUrgencyColor = (dueAt: string) => {
    const dueDate = new Date(dueAt);
    if (isToday(dueDate)) return 'text-destructive';
    if (isTomorrow(dueDate)) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const formatDueDate = (dueAt: string) => {
    const dueDate = new Date(dueAt);
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return formatDistanceToNow(dueDate, { addSuffix: true });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Courses */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Enrolled Courses
          </CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-500">{courses.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Active this semester</p>
        </CardContent>
      </Card>

      {/* Upcoming Assignments */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Due This Week
          </CardTitle>
          <Calendar className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-500">{upcomingAssignments.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Upcoming assignments</p>
        </CardContent>
      </Card>

      {/* GPA */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current GPA
          </CardTitle>
          <Trophy className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">{calculateGPA()}</div>
          <p className="text-xs text-muted-foreground mt-1">Keep up the great work!</p>
        </CardContent>
      </Card>

      {/* Due Today */}
      <Card className={`bg-gradient-to-br ${dueToday.length > 0 ? 'from-destructive/10 to-destructive/5 border-destructive/20' : 'from-muted/50 to-muted/30 border-border'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Due Today
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${dueToday.length > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${dueToday.length > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {dueToday.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dueToday.length > 0 ? 'Get these done!' : 'All clear for today'}
          </p>
        </CardContent>
      </Card>

      {/* Next Deadlines - Full Width */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {nextDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {nextDeadlines.map((assignment) => {
                const course = courses.find(c => c.id === assignment.course_id);
                return (
                  <div 
                    key={assignment.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{assignment.name}</p>
                      <p className="text-xs text-muted-foreground">{course?.name || 'Unknown Course'}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {assignment.points_possible && (
                        <Badge variant="secondary" className="text-xs">
                          {assignment.points_possible} pts
                        </Badge>
                      )}
                      <span className={`text-sm font-medium ${getUrgencyColor(assignment.due_at!)}`}>
                        {formatDueDate(assignment.due_at!)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
