'use client';

interface StatusBadgeProps {
  label: string;
  variant?: 'info' | 'warning' | 'success' | 'error' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  error: 'bg-red-50 text-red-700',
  neutral: 'bg-stone-100 text-stone-600',
  purple: 'bg-purple-50 text-purple-700',
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
