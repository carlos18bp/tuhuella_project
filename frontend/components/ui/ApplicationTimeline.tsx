'use client';

import type { AdoptionApplicationStatus } from '@/lib/types';

const STEPS: { key: AdoptionApplicationStatus; label: string }[] = [
  { key: 'submitted', label: 'Enviada' },
  { key: 'reviewing', label: 'En revisión' },
  { key: 'interview', label: 'Entrevista' },
  { key: 'approved', label: 'Aprobada' },
];

const stepIndex = (status: AdoptionApplicationStatus): number => {
  if (status === 'rejected') return -1;
  return STEPS.findIndex((s) => s.key === status);
};

interface ApplicationTimelineProps {
  status: AdoptionApplicationStatus;
  className?: string;
}

export default function ApplicationTimeline({ status, className = '' }: ApplicationTimelineProps) {
  const currentIdx = stepIndex(status);
  const isRejected = status === 'rejected';

  return (
    <div className={`w-full ${className}`} role="list" aria-label="Estado de la solicitud">
      <div className="flex items-start justify-between gap-1">
        {STEPS.map((step, idx) => {
          const isCompleted = !isRejected && idx < currentIdx;
          const isCurrent = !isRejected && idx === currentIdx;

          let dotColor = 'bg-stone-200 border-stone-300';
          let lineColor = 'bg-stone-200';
          let labelColor = 'text-stone-400';

          if (isCompleted) {
            dotColor = 'bg-emerald-500 border-emerald-500';
            lineColor = 'bg-emerald-500';
            labelColor = 'text-emerald-700';
          } else if (isCurrent) {
            dotColor = 'bg-teal-500 border-teal-500 ring-4 ring-teal-100';
            labelColor = 'text-teal-700 font-semibold';
          }

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center" role="listitem">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div className={`h-[3px] flex-1 rounded-full transition-colors ${
                    isCompleted || isCurrent ? lineColor : 'bg-stone-200'
                  }`} />
                )}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${isCurrent ? 'scale-125 shadow-sm' : ''} ${dotColor}`}
                  aria-hidden="true"
                />
                {idx < STEPS.length - 1 && (
                  <div className={`h-[3px] flex-1 rounded-full transition-colors ${
                    isCompleted ? lineColor : 'bg-stone-200'
                  }`} />
                )}
              </div>
              <span className={`mt-2 text-xs text-center leading-tight ${labelColor}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/60 px-4 py-2.5" role="alert">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm text-red-700 font-medium">Solicitud rechazada</span>
        </div>
      )}
    </div>
  );
}
