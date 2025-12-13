/*
  CIRCULAR PROGRESS COMPONENT
  ===========================
  A beautiful SVG-based circular progress indicator for the timer
*/

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  state: 'idle' | 'running' | 'paused' | 'break';
  children: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 8,
  state,
  children,
}: CircularProgressProps) {
  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  // Get color based on state
  const getStrokeColor = () => {
    switch (state) {
      case 'running':
        return 'hsl(var(--timer-active))';
      case 'paused':
        return 'hsl(var(--timer-paused))';
      case 'break':
        return 'hsl(var(--timer-break))';
      default:
        return 'hsl(var(--timer-ring))';
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Progress Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--timer-ring-bg))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-out"
          style={{
            filter: state === 'running' ? 'drop-shadow(0 0 10px currentColor)' : 'none',
          }}
        />
      </svg>

      {/* Content in the center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
