'use client';

interface StatusBadgeProps {
  label: string;
  variant?: 'info' | 'warning' | 'success' | 'error' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  error: 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
  neutral: 'bg-surface-tertiary text-text-secondary ring-1 ring-border-primary/60',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/60',
};

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function StatusBadge({
  label,
  variant = 'neutral',
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {label}
    </span>
  );
}
