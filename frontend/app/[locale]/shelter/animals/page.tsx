'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAnimalStore } from '@/lib/stores/animalStore';
import { ROUTES } from '@/lib/constants';
import type { Animal } from '@/lib/types';

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-surface-tertiary text-text-secondary' },
  published: { label: 'Publicado', color: 'bg-teal-50 text-teal-700' },
  in_process: { label: 'En proceso', color: 'bg-amber-50 text-amber-700' },
  adopted: { label: 'Adoptado', color: 'bg-emerald-50 text-emerald-700' },
  archived: { label: 'Archivado', color: 'bg-surface-tertiary text-text-tertiary' },
};

export default function ShelterAnimalsPage() {
  useRequireAuth();
  const animals = useAnimalStore((s) => s.animals);
  const loading = useAnimalStore((s) => s.loading);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    void fetchAnimals({ shelter: -1 }); // -1 as sentinel for "my shelter"
  }, [fetchAnimals]);

  const filtered = filter === 'all' ? animals : animals.filter((a) => a.status === filter);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestión de Animales</h1>
          <p className="mt-1 text-text-tertiary">{animals.length} animales registrados</p>
        </div>
        <Link href={ROUTES.SHELTER_ANIMALS + '/nuevo'}
          className="bg-teal-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-teal-700 transition-colors text-center">
          + Agregar animal
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {['all', 'draft', 'published', 'in_process', 'adopted', 'archived'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === s ? 'bg-teal-600 text-white border-teal-600' : 'border-border-primary text-text-secondary hover:bg-surface-hover'
            }`}>
            {s === 'all' ? 'Todos' : statusLabels[s]?.label ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-primary p-5 animate-pulse space-y-3">
              <div className="h-5 bg-surface-tertiary rounded w-2/3" />
              <div className="h-3 bg-surface-tertiary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-text-quaternary">No hay animales con este filtro.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((animal: Animal) => {
            const st = statusLabels[animal.status] ?? { label: animal.status, color: 'bg-surface-tertiary text-text-secondary' };
            return (
              <Link key={animal.id} href={ROUTES.ANIMAL_DETAIL(animal.id)}
                className="rounded-2xl border border-border-primary bg-surface-primary p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-text-primary">{animal.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <p className="text-sm text-text-tertiary mt-1">
                  {animal.species === 'dog' ? 'Perro' : animal.species === 'cat' ? 'Gato' : 'Otro'} · {animal.breed || 'Sin raza'} · {animal.size}
                </p>
                <p className="text-xs text-text-quaternary mt-2">
                  {animal.is_vaccinated ? '✓ Vacunado' : '✗ Sin vacunar'} · {animal.is_sterilized ? '✓ Esterilizado' : '✗ Sin esterilizar'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
