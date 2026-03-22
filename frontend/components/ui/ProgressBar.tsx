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
    <div className={`w-full bg-stone-100 rounded-full ${height} ${className}`}>
      <div
        className={`${color} ${height} rounded-full transition-all`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}
