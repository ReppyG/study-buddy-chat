/*
  POMODORO TIMER COMPONENT
  ========================
  The main timer component that brings everything together!
  
  Features:
  - 25-minute focus sessions (customizable)
  - Short and long breaks
  - Progress ring visualization
  - Sound notification when timer ends
  - AI-generated motivation after each session
  - Statistics tracking in localStorage
*/

import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, Sparkles } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { StatsDisplay } from './StatsDisplay';
import { MotivationModal } from './MotivationModal';
import { SettingsModal } from './SettingsModal';
import { usePomodoroStats } from '@/hooks/usePomodoroStats';
import { TimerState, TimerSettings, DEFAULT_SETTINGS, PomodoroSession } from '@/types/pomodoro';
import { toast } from 'sonner';

export function PomodoroTimer() {
  // TIMER SETTINGS
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const stored = localStorage.getItem('pomodoro-settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  // TIMER STATE
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [currentDuration, setCurrentDuration] = useState(settings.focusDuration * 60);
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const [showMotivation, setShowMotivation] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);

  // STATS
  const { stats, recordSession } = usePomodoroStats();

  // AUDIO REF for notification sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Create audio element for notification
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVIBQqLf4KVkFAFIsuHbdCMnZdbs1nlKL6Po1+OQblJD2f/tmYdYXL/x/6N+dWqk8v+xh31ioO7/so97YKDw/7SOfWah8f+1jX1mpfP/t5F/aqj0/7qUgW+s9/+8loNzsPn/vpmFd7P7/8Gch3u4/f/DnYl+vP//xZ+Lgrz//8egjoS9//7HoY6EvsD+x6GOhr/A/cegjoW/wP3HoI6Fv8D9yKGPhr/A/cihj4bAwP3IoY+HwMD8yKKQh8DA/Miij4jAwPzJopCIwMH8yaKQiMHB/Mmjkoq=');
    audioRef.current.volume = 0.5;
  }, []);

  // TIMER COUNTDOWN LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === 'running' || state === 'break') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete!
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state]);

  // TIMER COMPLETE HANDLER
  const handleTimerComplete = useCallback(() => {
    // Play notification sound
    audioRef.current?.play().catch(() => {});

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(isBreakMode ? 'Break time is over!' : 'Great job! Session complete! 🎉', {
        body: isBreakMode ? 'Ready to study again?' : 'Time for a break!',
        icon: '🍅',
      });
    }

    if (isBreakMode) {
      // Break completed
      toast.success('Break complete! Ready to focus?');
      setState('idle');
      setIsBreakMode(false);
      setTimeLeft(settings.focusDuration * 60);
      setCurrentDuration(settings.focusDuration * 60);
    } else {
      // Focus session completed
      const session: PomodoroSession = {
        id: crypto.randomUUID(),
        duration: settings.focusDuration,
        completedAt: new Date(),
        type: 'focus',
      };
      recordSession(session);
      
      setState('idle');
      setShowBreakOptions(true);
      setShowMotivation(true);
    }
  }, [isBreakMode, settings.focusDuration, recordSession]);

  // REQUEST NOTIFICATION PERMISSION
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // CONTROL FUNCTIONS
  const handleStart = () => {
    if (state === 'idle' && !isBreakMode) {
      setTimeLeft(settings.focusDuration * 60);
      setCurrentDuration(settings.focusDuration * 60);
    }
    setState('running');
    setShowBreakOptions(false);
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleReset = () => {
    setState('idle');
    setIsBreakMode(false);
    setTimeLeft(settings.focusDuration * 60);
    setCurrentDuration(settings.focusDuration * 60);
    setShowBreakOptions(false);
  };

  const handleStartBreak = (isLong: boolean) => {
    const breakDuration = isLong ? settings.longBreakDuration : settings.shortBreakDuration;
    setIsBreakMode(true);
    setTimeLeft(breakDuration * 60);
    setCurrentDuration(breakDuration * 60);
    setState('break');
    setShowBreakOptions(false);
    toast.info(`${breakDuration} minute break started!`);
  };

  // Calculate progress (0 to 1)
  const progress = currentDuration > 0 ? (currentDuration - timeLeft) / currentDuration : 0;

  // Get timer label
  const getLabel = () => {
    if (isBreakMode) return 'BREAK TIME';
    switch (state) {
      case 'running': return 'FOCUS MODE';
      case 'paused': return 'PAUSED';
      default: return 'READY TO FOCUS';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Pomodoro Timer</h2>
        </div>
        <SettingsModal settings={settings} onSave={setSettings} />
      </div>

      {/* Timer Circle */}
      <div className="mb-6">
        <CircularProgress
          progress={progress}
          state={isBreakMode ? 'break' : state}
          size={260}
          strokeWidth={8}
        >
          <TimerDisplay
            timeLeft={timeLeft}
            state={isBreakMode ? 'break' : state}
            label={getLabel()}
          />
        </CircularProgress>
      </div>

      {/* Controls */}
      <div className="mb-8">
        <TimerControls
          state={isBreakMode ? 'break' : state}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onStartBreak={handleStartBreak}
          showBreakOptions={showBreakOptions}
        />
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm">
        <StatsDisplay stats={stats} />
      </div>

      {/* Motivation Modal */}
      <MotivationModal
        open={showMotivation}
        onClose={() => setShowMotivation(false)}
        sessionCount={stats.sessionsToday}
        totalMinutes={stats.totalMinutesToday}
        onStartBreak={handleStartBreak}
        onStudyAgain={handleStart}
      />
    </div>
  );
}
