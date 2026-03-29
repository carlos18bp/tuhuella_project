'use client';

import type { Animal } from '@/lib/types';
import AnimalCard from './AnimalCard';

interface AnimalGridProps {
  animals: Animal[];
  loading?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
}

export default function AnimalGrid({
  animals,
  loading = false,
  emptyMessage = 'No se encontraron animales.',
  skeletonCount = 6,
}: AnimalGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-primary/60 bg-surface-primary overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-[4/3] bg-surface-tertiary" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-surface-tertiary rounded-lg w-2/3" />
              <div className="h-3 bg-surface-tertiary rounded-lg w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {animals.length === 0 ? (
        <p className="text-text-quaternary col-span-full">{emptyMessage}</p>
      ) : (
        animals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))
      )}
    </div>
  );
}
