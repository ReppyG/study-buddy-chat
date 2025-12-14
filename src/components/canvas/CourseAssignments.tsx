// Course assignments tab component
import { useState } from 'react';
import { ExternalLink, Plus, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, XCircle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns';
import type { CanvasAssignment } from '@/types/canvas';

type AssignmentStatus = 'upcoming' | 'submitted' | 'graded' | 'missing' | 'all';

interface CourseAssignmentsProps {
  assignments: CanvasAssignment[];
  courseName: string;
  onAddToStudyPlan?: (assignment: CanvasAssignment) => void;
}

export function CourseAssignments({ assignments, courseName, onAddToStudyPlan }: CourseAssignmentsProps) {
  const [filter, setFilter] = useState<AssignmentStatus>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'title' | 'points'>('due_date');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Categorize assignments (mock - would need submission data)
  const categorizeAssignment = (assignment: CanvasAssignment): AssignmentStatus => {
    if (!assignment.due_at) return 'upcoming';
    const dueDate = new Date(assignment.due_at);
    if (isPast(dueDate)) {
      // Mock: randomly assign graded/submitted/missing for demo
      const rand = assignment.id % 3;
      return rand === 0 ? 'graded' : rand === 1 ? 'submitted' : 'missing';
    }
    return 'upcoming';
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    return categorizeAssignment(a) === filter;
  });

  // Sort assignments
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      case 'title':
        return a.name.localeCompare(b.name);
      case 'points':
        return (b.points_possible || 0) - (a.points_possible || 0);
      default:
        return 0;
    }
  });

  // Group by status
  const groupedAssignments = {
    upcoming: sortedAssignments.filter(a => categorizeAssignment(a) === 'upcoming'),
    submitted: sortedAssignments.filter(a => categorizeAssignment(a) === 'submitted'),
    graded: sortedAssignments.filter(a => categorizeAssignment(a) === 'graded'),
    missing: sortedAssignments.filter(a => categorizeAssignment(a) === 'missing'),
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'submitted': return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'graded': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missing': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    const variants: Record<AssignmentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      upcoming: { variant: 'default', label: 'Upcoming' },
      submitted: { variant: 'secondary', label: 'Submitted' },
      graded: { variant: 'outline', label: 'Graded' },
      missing: { variant: 'destructive', label: 'Missing' },
      all: { variant: 'outline', label: 'All' },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatDueDate = (dueAt: string) => {
    const date = new Date(dueAt);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const renderAssignmentGroup = (title: string, items: CanvasAssignment[], status: AssignmentStatus) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <h3 className="font-medium">{title}</h3>
          <Badge variant="outline" className="ml-auto">{items.length}</Badge>
        </div>
        
        <div className="space-y-2">
          {items.map((assignment) => (
            <Collapsible key={assignment.id} open={expandedIds.has(assignment.id)}>
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button 
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(assignment.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{assignment.name}</p>
                          {assignment.locked_for_user && (
                            <Badge variant="outline" className="text-xs">Locked</Badge>
                          )}
                        </div>
                        {assignment.due_at && (
                          <p className={`text-sm mt-1 ${isPast(new Date(assignment.due_at)) && status !== 'graded' ? 'text-destructive' : 'text-muted-foreground'}`}>
                            Due: {formatDueDate(assignment.due_at)}
                            {!isPast(new Date(assignment.due_at)) && (
                              <span className="ml-2 text-xs">
                                ({formatDistanceToNow(new Date(assignment.due_at), { addSuffix: true })})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {assignment.points_possible && (
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {status === 'graded' ? `${Math.floor(assignment.points_possible * 0.85)}/` : ''}{assignment.points_possible}
                            </p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        )}
                        {expandedIds.has(assignment.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 border-t">
                    {assignment.description ? (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none mt-3"
                        dangerouslySetInnerHTML={{ __html: assignment.description }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-3">No description provided.</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                      <Badge variant="outline" className="text-xs">
                        {assignment.submission_types.join(', ')}
                      </Badge>
                      
                      <div className="flex-1" />
                      
                      {onAddToStudyPlan && status === 'upcoming' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToStudyPlan(assignment);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Study Plan
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" asChild>
                        <a href={assignment.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open in Canvas
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as AssignmentStatus)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="points">Points</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Assignment Groups */}
      {filter === 'all' ? (
        <div className="space-y-8">
          {renderAssignmentGroup('Upcoming', groupedAssignments.upcoming, 'upcoming')}
          {renderAssignmentGroup('Submitted', groupedAssignments.submitted, 'submitted')}
          {renderAssignmentGroup('Graded', groupedAssignments.graded, 'graded')}
          {renderAssignmentGroup('Missing', groupedAssignments.missing, 'missing')}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{assignment.name}</p>
                    {assignment.due_at && (
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDueDate(assignment.due_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.points_possible && (
                      <Badge variant="outline">{assignment.points_possible} pts</Badge>
                    )}
                    {getStatusBadge(categorizeAssignment(assignment))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No assignments found with the current filter.
        </div>
      )}
    </div>
  );
}
