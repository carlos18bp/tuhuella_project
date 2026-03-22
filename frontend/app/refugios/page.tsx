'use client';

import { useEffect } from 'react';

import { useShelterStore } from '@/lib/stores/shelterStore';
import { ShelterCard, EmptyState } from '@/components/ui';

export default function RefugiosPage() {
  const shelters = useShelterStore((s) => s.shelters);
  const loading = useShelterStore((s) => s.loading);
  const fetchShelters = useShelterStore((s) => s.fetchShelters);

  useEffect(() => {
    if (shelters.length === 0) void fetchShelters();
  }, [fetchShelters, shelters.length]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Refugios verificados</h1>
      <p className="mt-2 text-stone-500">Conoce a las organizaciones que protegen vidas</p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-6 animate-pulse">
                <div className="h-5 bg-stone-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            ))
          : shelters.map((shelter) => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
        {!loading && shelters.length === 0 && (
          <EmptyState message="No hay refugios disponibles." icon="🏠" />
        )}
      </div>
    </div>
  );
}
