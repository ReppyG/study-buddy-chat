import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useAssignments } from '@/hooks/useAssignments';
import { usePomodoroStats } from '@/hooks/usePomodoroStats';
import {
  Target, Clock, CalendarDays, TrendingUp, BookOpen, FileText,
  CheckCircle2, AlertCircle, Timer, Sparkles, ArrowRight, Play, Flame
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { SAMPLE_COURSES } from '@/types/assignment';

// Daily Focus Widget
export const DailyFocusWidget: React.FC = () => {
  const { assignments } = useAssignments();
  const today = new Date();
  
  const getCourseName = (courseId: string) => {
    return SAMPLE_COURSES.find(c => c.id === courseId)?.name || courseId;
  };
  
  const urgentAssignment = assignments
    .filter(a => a.status !== 'completed' && new Date(a.dueDate) >= today)
    .sort((a, b) => {
      const aDays = differenceInDays(new Date(a.dueDate), today);
      const bDays = differenceInDays(new Date(b.dueDate), today);
      return aDays - bDays;
    })[0];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Today's Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {urgentAssignment ? (
          <div className="space-y-2">
            <p className="font-medium">{urgentAssignment.title}</p>
            <p className="text-sm text-muted-foreground">{getCourseName(urgentAssignment.courseId)}</p>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4" />
              <span>Due {format(new Date(urgentAssignment.dueDate), 'MMM d')}</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No urgent tasks - great job!</p>
        )}
        <Link to="/timer">
          <Button size="sm" className="w-full gap-2">
            <Play className="w-4 h-4" />
            Start Study Session
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

// Assignments Widget
export const AssignmentsWidget: React.FC = () => {
  const { assignments } = useAssignments();
  const today = new Date();

  const dueToday = assignments.filter(a => a.status !== 'completed' && isToday(new Date(a.dueDate)));
  const dueTomorrow = assignments.filter(a => a.status !== 'completed' && isTomorrow(new Date(a.dueDate)));
  const dueThisWeek = assignments.filter(a => 
    a.status !== 'completed' && 
    isThisWeek(new Date(a.dueDate)) && 
    !isToday(new Date(a.dueDate)) && 
    !isTomorrow(new Date(a.dueDate))
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Assignments
          </CardTitle>
          <Link to="/tasks">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">Due Today</span>
            </div>
            <Badge variant="destructive">{dueToday.length}</Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Due Tomorrow</span>
            </div>
            <Badge className="bg-yellow-500">{dueTomorrow.length}</Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <Badge className="bg-blue-500">{dueThisWeek.length}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Study Stats Widget
export const StudyStatsWidget: React.FC = () => {
  const { stats } = usePomodoroStats();
  const weeklyData = stats.weeklyData || [0, 0, 0, 0, 0, 0, 0];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxMinutes = Math.max(...weeklyData, 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Study Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{stats.sessionsToday}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              {stats.totalMinutesToday}m
            </p>
            <p className="text-xs text-muted-foreground">Study Time</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-2xl font-bold text-orange-500">{stats.streak}</p>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">This Week</p>
          <div className="flex items-end gap-1 h-16">
            {weeklyData.map((minutes, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t transition-all hover:bg-primary/30"
                style={{ height: `${(minutes / maxMinutes) * 100}%`, minHeight: '4px' }}
                title={`${days[i]}: ${minutes} min`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            {days.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Grades Widget
export const GradesWidget: React.FC = () => {
  // Simplified - no Canvas courses for now
  const coursesWithGrades: { id: number; name: string; currentGrade?: number }[] = [];
  const avgGrade = coursesWithGrades.length > 0
    ? coursesWithGrades.reduce((sum, c) => sum + (c.currentGrade || 0), 0) / coursesWithGrades.length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Grades
          </CardTitle>
          <Link to="/canvas/grades">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {coursesWithGrades.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{avgGrade.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Average Grade</p>
            </div>
            <div className="space-y-2">
              {coursesWithGrades.slice(0, 4).map(course => (
                <div key={course.id} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{course.name}</span>
                  <span className={cn(
                    'text-sm font-medium',
                    (course.currentGrade || 0) >= 90 ? 'text-green-500' :
                    (course.currentGrade || 0) >= 80 ? 'text-blue-500' :
                    (course.currentGrade || 0) >= 70 ? 'text-yellow-500' : 'text-red-500'
                  )}>
                    {course.currentGrade?.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Connect Canvas to see grades</p>
            <Link to="/canvas">
              <Button variant="link" size="sm">Connect Now</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Recent Activity Widget
export const RecentActivityWidget: React.FC = () => {
  const { recentActivity } = useApp();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'task': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'course': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'timer': return <Timer className="w-4 h-4 text-orange-500" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, i) => (
              <Link
                key={i}
                to={activity.path}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Quick Timer Widget
export const QuickTimerWidget: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Timer className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-medium">Quick Study Session</p>
              <p className="text-sm text-muted-foreground">25 min focus time</p>
            </div>
          </div>
          <Link to="/timer">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Play className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
