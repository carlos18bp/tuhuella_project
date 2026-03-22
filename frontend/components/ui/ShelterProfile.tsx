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
          <h1 className="text-3xl font-bold text-stone-800">{shelter.name}</h1>
          <p className="text-stone-500 mt-1">{shelter.city}</p>
        </div>
        <VerifiedBadge status={shelter.verification_status} size="md" />
      </div>

      {shelter.description && (
        <p className="mt-4 text-stone-600 leading-relaxed max-w-3xl">{shelter.description}</p>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shelter.phone && (
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">Teléfono</p>
            <p className="text-sm font-medium text-stone-700 mt-1">{shelter.phone}</p>
          </div>
        )}
        {shelter.email && (
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">Email</p>
            <p className="text-sm font-medium text-stone-700 mt-1">{shelter.email}</p>
          </div>
        )}
        {shelter.website && (
          <div className="rounded-xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">Sitio web</p>
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
