'use client';

import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}

export default function MetricCard({ label, value, icon: Icon, color, iconColor }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <Icon className={`h-4 w-4 ${iconColor} mb-2`} />
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
    </div>
  );
}
