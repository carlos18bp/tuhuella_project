'use client';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: string;
  className?: string;
}

export default function ProgressBar({
  percentage,
  color = 'bg-amber-500',
  height = 'h-2',
  className = '',
}: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className={`w-full bg-stone-100 rounded-full ring-1 ring-stone-200/40 ${height} ${className}`}>
      <div
        data-testid="progress-fill"
        className={`${color} ${height} rounded-full transition-all progress-shine`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}
