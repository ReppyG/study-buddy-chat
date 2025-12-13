/*
  STATS DISPLAY COMPONENT
  =======================
  Shows study statistics and weekly progress chart
*/

import { PomodoroStats } from '@/types/pomodoro';
import { Flame, Clock, Target, TrendingUp } from 'lucide-react';

interface StatsDisplayProps {
  stats: PomodoroStats;
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  // Days of the week for chart
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Get current day index (0 = Sunday in JS, we want Monday = 0)
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  
  // Find max value for chart scaling
  const maxMinutes = Math.max(...stats.weeklyData, 30);

  // Format time nicely
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sessions today */}
        <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.sessionsToday}</p>
            <p className="text-xs text-muted-foreground">Sessions today</p>
          </div>
        </div>

        {/* Time today */}
        <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--timer-active))] flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatTime(stats.totalMinutesToday)}</p>
            <p className="text-xs text-muted-foreground">Study time</p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--timer-break))] flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day streak 🔥</p>
          </div>
        </div>

        {/* Weekly total */}
        <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[hsl(var(--timer-paused))] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(stats.weeklyData.reduce((a, b) => a + b, 0))}
            </p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="bg-secondary/30 rounded-xl p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Weekly Progress</p>
        <div className="flex items-end justify-between gap-1 h-20">
          {stats.weeklyData.map((minutes, index) => {
            const height = Math.max((minutes / maxMinutes) * 100, 5);
            const isToday = index === adjustedToday;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isToday ? 'gradient-bg' : 'bg-muted'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {days[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
