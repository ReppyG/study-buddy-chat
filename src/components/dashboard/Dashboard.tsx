import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DailyFocusWidget,
  AssignmentsWidget,
  StudyStatsWidget,
  GradesWidget,
  RecentActivityWidget,
  QuickTimerWidget,
} from './DashboardWidgets';

export const Dashboard: React.FC = () => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Study Buddy</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{greeting()}! 👋</h1>
          <p className="text-muted-foreground">
            Here's your study overview for today
          </p>
        </div>

        {/* Quick Timer */}
        <QuickTimerWidget />

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            <DailyFocusWidget />
            <AssignmentsWidget />
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <StudyStatsWidget />
            <GradesWidget />
          </div>

          {/* Column 3 */}
          <div className="space-y-6 md:col-span-2 lg:col-span-1">
            <RecentActivityWidget />
          </div>
        </div>
      </div>
    </>
  );
};
