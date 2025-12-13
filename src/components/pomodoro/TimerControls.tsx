/*
  TIMER CONTROLS COMPONENT
  ========================
  Start, Pause, Reset buttons for the Pomodoro timer
*/

import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  state: 'idle' | 'running' | 'paused' | 'break';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStartBreak: (isLong: boolean) => void;
  showBreakOptions: boolean;
}

export function TimerControls({
  state,
  onStart,
  onPause,
  onReset,
  onStartBreak,
  showBreakOptions,
}: TimerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main control buttons */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        {state === 'running' ? (
          <Button
            onClick={onPause}
            size="lg"
            className="w-14 h-14 rounded-full bg-[hsl(var(--timer-paused))] hover:bg-[hsl(var(--timer-paused))]/80 text-primary-foreground"
          >
            <Pause className="w-6 h-6" />
          </Button>
        ) : (
          <Button
            onClick={onStart}
            size="lg"
            className="w-14 h-14 rounded-full gradient-bg hover:opacity-90 text-primary-foreground"
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        )}

        {/* Reset button */}
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Break options - shown after completing a session */}
      {showBreakOptions && (
        <div className="flex items-center gap-2 animate-slide-up">
          <Button
            onClick={() => onStartBreak(false)}
            variant="outline"
            size="sm"
            className="gap-2 border-[hsl(var(--timer-break))] text-[hsl(var(--timer-break))] hover:bg-[hsl(var(--timer-break))]/10"
          >
            <Coffee className="w-4 h-4" />
            5 min break
          </Button>
          <Button
            onClick={() => onStartBreak(true)}
            variant="outline"
            size="sm"
            className="gap-2 border-[hsl(var(--timer-break))] text-[hsl(var(--timer-break))] hover:bg-[hsl(var(--timer-break))]/10"
          >
            <Coffee className="w-4 h-4" />
            15 min break
          </Button>
          <Button
            onClick={onStart}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Study again
          </Button>
        </div>
      )}
    </div>
  );
}
