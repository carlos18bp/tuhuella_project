'use client';

import type { Shelter } from '@/lib/types';
import VerifiedBadge from './VerifiedBadge';

interface ShelterProfileProps {
  shelter: Shelter;
}

export default function ShelterProfile({ shelter }: ShelterProfileProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-[-0.02em]">{shelter.name}</h1>
          <p className="text-text-tertiary mt-1">{shelter.city}</p>
        </div>
        <VerifiedBadge status={shelter.verification_status} size="md" />
      </div>

      {shelter.description && (
        <p className="mt-4 text-text-secondary leading-relaxed max-w-3xl">{shelter.description}</p>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shelter.phone && (
          <div className="rounded-xl border border-border-primary/80 bg-surface-secondary/50 p-5 hover:bg-surface-primary hover:shadow-sm hover:border-border-secondary/80 transition-all duration-200">
            <p className="text-xs font-medium text-text-quaternary uppercase tracking-wider">Teléfono</p>
            <p className="text-sm font-medium text-text-secondary mt-1">{shelter.phone}</p>
          </div>
        )}
        {shelter.email && (
          <div className="rounded-xl border border-border-primary/80 bg-surface-secondary/50 p-5 hover:bg-surface-primary hover:shadow-sm hover:border-border-secondary/80 transition-all duration-200">
            <p className="text-xs font-medium text-text-quaternary uppercase tracking-wider">Email</p>
            <p className="text-sm font-medium text-text-secondary mt-1">{shelter.email}</p>
          </div>
        )}
        {shelter.website && (
          <div className="rounded-xl border border-border-primary/80 bg-surface-secondary/50 p-5 hover:bg-surface-primary hover:shadow-sm hover:border-border-secondary/80 transition-all duration-200">
            <p className="text-xs font-medium text-text-quaternary uppercase tracking-wider">Sitio web</p>
            <a
              href={shelter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-teal-600 mt-1 hover:underline"
            >
              {shelter.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
