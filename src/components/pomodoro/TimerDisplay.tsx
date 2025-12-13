/*
  TIMER DISPLAY COMPONENT
  =======================
  Shows the countdown time in MM:SS format
*/

interface TimerDisplayProps {
  timeLeft: number; // in seconds
  state: 'idle' | 'running' | 'paused' | 'break';
  label: string;
}

export function TimerDisplay({ timeLeft, state, label }: TimerDisplayProps) {
  // Convert seconds to MM:SS format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Get color based on state
  const getTextColor = () => {
    switch (state) {
      case 'running':
        return 'text-[hsl(var(--timer-active))]';
      case 'paused':
        return 'text-[hsl(var(--timer-paused))]';
      case 'break':
        return 'text-[hsl(var(--timer-break))]';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="text-center">
      {/* Timer label */}
      <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">
        {label}
      </p>
      
      {/* Big time display */}
      <p className={`text-6xl font-bold tabular-nums ${getTextColor()} transition-colors duration-300`}>
        {formattedTime}
      </p>
    </div>
  );
}
