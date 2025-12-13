/*
  POMODORO TYPES
  ==============
  TypeScript definitions for our timer
*/

export type TimerState = 'idle' | 'running' | 'paused' | 'break';

export interface PomodoroSession {
  id: string;
  duration: number; // in minutes
  completedAt: Date;
  type: 'focus' | 'short-break' | 'long-break';
}

export interface PomodoroStats {
  sessionsToday: number;
  totalMinutesToday: number;
  streak: number;
  lastSessionDate: string | null;
  weeklyData: number[]; // minutes per day for last 7 days
}

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};
