'use client';

import type { AdoptionApplicationStatus } from '@/lib/types';

const statusConfig: Record<AdoptionApplicationStatus, { label: string; color: string }> = {
  submitted: { label: 'Enviada', color: 'bg-stone-100 text-stone-600' },
  reviewing: { label: 'En revisión', color: 'bg-amber-50 text-amber-700' },
  interview: { label: 'Entrevista', color: 'bg-teal-50 text-teal-700' },
  approved: { label: 'Aprobada', color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-50 text-red-700' },
};

interface ApplicationStatusBadgeProps {
  status: AdoptionApplicationStatus;
}

export default function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, color: 'bg-stone-100 text-stone-600' };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}
