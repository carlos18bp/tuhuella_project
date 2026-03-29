'use client';

interface VerifiedBadgeProps {
  status: 'pending' | 'verified' | 'rejected';
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; color: string }> = {
  verified: { label: 'Verificado', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' },
  pending: { label: 'Pendiente de verificación', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60' },
  rejected: { label: 'Rechazado', color: 'bg-red-50 text-red-700 ring-1 ring-red-200/60' },
};

const sizeStyles: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function VerifiedBadge({ status, size = 'sm' }: VerifiedBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <span className={`inline-block rounded-full font-medium ${config.color} ${sizeStyles[size]}`}>
      {config.label}
    </span>
  );
}
