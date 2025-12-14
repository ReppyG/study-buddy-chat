// Main Canvas dashboard component
import { useState } from 'react';
import { LayoutDashboard, Grid, Calendar, Settings, RefreshCw, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewCard } from './OverviewCard';
import { CourseGrid } from './CourseGrid';
import { CourseDetail } from './CourseDetail';
import { CanvasCalendar } from './CanvasCalendar';
import { CanvasSettings } from './CanvasSettings';
import { SyncStatus } from './SyncStatus';
import { useCanvas } from '@/hooks/useCanvas';
import { toast } from 'sonner';
import type { CanvasAssignment } from '@/types/canvas';

interface CanvasDashboardProps {
  onAddToStudyPlan?: (assignment: CanvasAssignment) => void;
}

export function CanvasDashboard({ onAddToStudyPlan }: CanvasDashboardProps) {
  const {
    connection,
    connectionStatus,
    testMode,
    canvasData,
    syncState,
    syncAllData,
  } = useCanvas();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'settings'>('dashboard');

  const isConnected = connectionStatus === 'connected';

  // If not connected, show settings
  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Connect to Canvas</h2>
            <p className="text-sm text-muted-foreground">
              Link your Canvas account to import your courses and assignments
            </p>
          </div>
        </div>
        <CanvasSettings />
      </div>
    );
  }

  // If viewing a specific course
  if (selectedCourseId !== null && canvasData) {
    const course = canvasData.courses.find(c => c.id === selectedCourseId);
    if (course) {
      const courseAnnouncements = canvasData.announcements.filter(
        a => a.context_code === `course_${selectedCourseId}`
      );
      
      return (
        <CourseDetail
          course={course}
          assignments={canvasData.assignments[selectedCourseId] || []}
          grades={[]}
          announcements={courseAnnouncements}
          syllabus={null}
          onBack={() => setSelectedCourseId(null)}
          onAddToStudyPlan={onAddToStudyPlan}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Canvas Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {testMode ? 'Test Mode - Using sample data' : `Connected as ${connection?.userName}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncAllData}
            disabled={syncState.isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      <SyncStatus syncState={syncState} onSync={syncAllData} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <Grid className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {canvasData ? (
            <>
              {/* Overview Stats */}
              <OverviewCard 
                courses={canvasData.courses} 
                assignments={canvasData.assignments}
              />

              {/* Course Grid */}
              <div>
                <h3 className="text-lg font-medium mb-4">Your Courses</h3>
                <CourseGrid
                  courses={canvasData.courses}
                  assignments={canvasData.assignments}
                  announcements={canvasData.announcements}
                  onCourseClick={(courseId) => setSelectedCourseId(courseId)}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available. Click Sync to fetch your Canvas data.
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          {canvasData ? (
            <CanvasCalendar
              courses={canvasData.courses}
              assignments={canvasData.assignments}
              onAssignmentClick={(assignment) => {
                toast.info(`Opening ${assignment.name}`);
              }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available. Click Sync to fetch your Canvas data.
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <CanvasSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
