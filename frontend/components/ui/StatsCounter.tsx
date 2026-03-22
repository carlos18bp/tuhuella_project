'use client';

interface Stat {
  label: string;
  value: string;
}

interface StatsCounterProps {
  stats: Stat[];
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl bg-white/80 border border-stone-200 p-4">
          <p className="text-xs text-stone-500">{stat.label}</p>
          <p className="mt-1 text-sm font-semibold text-stone-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
