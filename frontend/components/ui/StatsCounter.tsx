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
        <div key={stat.label} className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 p-5 hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-200" />
          <p className="text-xs text-stone-500">{stat.label}</p>
          <p className="mt-1 text-xl font-bold text-stone-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
