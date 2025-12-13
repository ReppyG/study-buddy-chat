/*
  POMODORO STORAGE HOOK
  =====================
  Handles saving and loading stats from localStorage
*/

import { useState, useEffect } from 'react';
import { PomodoroStats, PomodoroSession } from '@/types/pomodoro';

const STORAGE_KEY = 'pomodoro-stats';

// Get today's date as a string (YYYY-MM-DD)
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get date string for a specific number of days ago
function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// Default stats object
const defaultStats: PomodoroStats = {
  sessionsToday: 0,
  totalMinutesToday: 0,
  streak: 0,
  lastSessionDate: null,
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
};

export function usePomodoroStats() {
  const [stats, setStats] = useState<PomodoroStats>(defaultStats);

  // Load stats from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const today = getTodayString();
        
        // Check if we need to reset today's stats (new day)
        if (parsed.lastSessionDate !== today) {
          // Shift weekly data and add new day
          const newWeeklyData = [...parsed.weeklyData.slice(1), 0];
          
          // Calculate streak
          const yesterday = getDateString(1);
          const newStreak = parsed.lastSessionDate === yesterday 
            ? parsed.streak 
            : (parsed.lastSessionDate === today ? parsed.streak : 0);
          
          setStats({
            ...parsed,
            sessionsToday: 0,
            totalMinutesToday: 0,
            streak: newStreak,
            weeklyData: newWeeklyData,
          });
        } else {
          setStats(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored stats:', e);
        setStats(defaultStats);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (stats.lastSessionDate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }
  }, [stats]);

  // Record a completed session
  const recordSession = (session: PomodoroSession) => {
    const today = getTodayString();
    const yesterday = getDateString(1);
    
    setStats(prev => {
      const isNewDay = prev.lastSessionDate !== today;
      const wasYesterday = prev.lastSessionDate === yesterday;
      
      // Calculate new streak
      let newStreak = prev.streak;
      if (isNewDay) {
        newStreak = wasYesterday ? prev.streak + 1 : 1;
      } else if (prev.sessionsToday === 0) {
        newStreak = prev.streak + 1;
      }
      
      // Update weekly data
      const newWeeklyData = isNewDay 
        ? [...prev.weeklyData.slice(1), session.duration]
        : [...prev.weeklyData.slice(0, -1), prev.weeklyData[6] + session.duration];
      
      return {
        sessionsToday: isNewDay ? 1 : prev.sessionsToday + 1,
        totalMinutesToday: isNewDay ? session.duration : prev.totalMinutesToday + session.duration,
        streak: newStreak,
        lastSessionDate: today,
        weeklyData: newWeeklyData,
      };
    });
  };

  // Reset today's stats (for testing)
  const resetStats = () => {
    setStats(defaultStats);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { stats, recordSession, resetStats };
}
