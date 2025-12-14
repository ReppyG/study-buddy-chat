// Study Plan Generator component
import { useState } from 'react';
import { Sparkles, Calendar, Clock, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useAIStudy } from '@/hooks/useAIStudy';
import { useCanvas } from '@/hooks/useCanvas';
import { useAssignments } from '@/hooks/useAssignments';
import type { StudyPlan } from '@/types/ai-study';

export function StudyPlanGenerator() {
  const { isLoading, createStudyPlan, getSavedStudyPlans } = useAIStudy();
  const { canvasData } = useCanvas();
  const { assignments: localAssignments } = useAssignments();
  
  const [planName, setPlanName] = useState('My Study Plan');
  const [studyHours, setStudyHours] = useState(3);
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Combine Canvas and local assignments
  const allAssignments = [
    ...Object.values(canvasData?.assignments || {}).flat().map(a => ({
      id: `canvas-${a.id}`,
      title: a.name,
      dueDate: a.due_at,
      course: canvasData?.courses.find(c => c.id === a.course_id)?.name || 'Canvas',
      source: 'canvas' as const,
    })),
    ...localAssignments.map(a => ({
      id: `local-${a.id}`,
      title: a.title,
      dueDate: a.dueDate,
      course: a.courseId,
      source: 'local' as const,
    })),
  ].filter(a => a.dueDate && new Date(a.dueDate) > new Date())
   .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const toggleAssignment = (id: string) => {
    const newSelected = new Set(selectedAssignments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAssignments(newSelected);
  };

  const handleGenerate = async () => {
    if (selectedAssignments.size === 0) {
      toast.error('Please select at least one assignment');
      return;
    }

    const selected = allAssignments.filter(a => selectedAssignments.has(a.id));
    const result = await createStudyPlan(selected, studyHours, planName);
    
    if (result) {
      setPlan(result);
      toast.success('Study plan created!');
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const exportToCalendar = () => {
    if (!plan) return;
    
    // Create ICS file
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Study Buddy//Study Plan//EN
`;

    plan.days.forEach(day => {
      day.tasks.forEach(task => {
        if (task.type !== 'break') {
          const date = day.date.replace(/-/g, '');
          icsContent += `BEGIN:VEVENT
DTSTART:${date}T090000
DTEND:${date}T100000
SUMMARY:${task.title}
DESCRIPTION:Duration: ${task.duration}\\nPriority: ${task.priority}
END:VEVENT
`;
        }
      });
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planName.replace(/\s+/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar exported! Import to Google Calendar or other apps.');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30';
      default: return 'bg-muted';
    }
  };

  // Show plan if generated
  if (plan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(plan.startDate), 'MMM d')} - {format(parseISO(plan.endDate), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCalendar}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPlan(null)}>
              New Plan
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {plan.days.map((day, dayIndex) => (
              <Card key={dayIndex}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(day.date), 'EEEE, MMMM d')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        completedTasks.has(task.id) 
                          ? 'bg-muted/50 opacity-60' 
                          : task.type === 'break' 
                            ? 'bg-blue-500/5 border-blue-500/20'
                            : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={completedTasks.has(task.id)}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${completedTasks.has(task.id) ? 'line-through' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.duration}
                          </span>
                          {task.type !== 'break' && (
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          )}
                          {task.type === 'break' && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">
                              Break
                            </Badge>
                          )}
                          {task.type === 'review' && (
                            <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500">
                              Review
                            </Badge>
                          )}
                        </div>
                      </div>
                      {completedTasks.has(task.id) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Setup view
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Plan Name</Label>
          <Input
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g., Finals Week Study Plan"
          />
        </div>

        <div className="space-y-2">
          <Label>Study Hours Per Day: {studyHours} hours</Label>
          <Slider
            value={[studyHours]}
            onValueChange={([v]) => setStudyHours(v)}
            min={1}
            max={8}
            step={0.5}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Assignments ({selectedAssignments.size} selected)</Label>
        <ScrollArea className="h-[200px] border rounded-lg p-4">
          {allAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming assignments found. Add assignments or connect to Canvas.
            </p>
          ) : (
            <div className="space-y-2">
              {allAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAssignments.has(assignment.id) ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleAssignment(assignment.id)}
                >
                  <Checkbox checked={selectedAssignments.has(assignment.id)} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">{assignment.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Due {format(new Date(assignment.dueDate!), 'MMM d')}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {assignment.source === 'canvas' ? 'Canvas' : 'Local'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isLoading || selectedAssignments.size === 0}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            Creating Plan...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Study Plan
          </>
        )}
      </Button>
    </div>
  );
}
