'use client';

import { useEffect, useState } from 'react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { AnimalCard, EmptyState } from '@/components/ui';
import type { AnimalSpecies, AnimalSize, AnimalAgeRange } from '@/lib/types';

const speciesOptions: { value: AnimalSpecies | ''; label: string }[] = [
  { value: '', label: 'Todas las especies' },
  { value: 'dog', label: 'Perros' },
  { value: 'cat', label: 'Gatos' },
  { value: 'other', label: 'Otros' },
];

const sizeOptions: { value: AnimalSize | ''; label: string }[] = [
  { value: '', label: 'Todos los tamaños' },
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];

const ageOptions: { value: AnimalAgeRange | ''; label: string }[] = [
  { value: '', label: 'Todas las edades' },
  { value: 'puppy', label: 'Cachorro' },
  { value: 'young', label: 'Joven' },
  { value: 'adult', label: 'Adulto' },
  { value: 'senior', label: 'Senior' },
];

export default function AnimalesPage() {
  const animals = useAnimalStore((s) => s.animals);
  const loading = useAnimalStore((s) => s.loading);
  const fetchAnimals = useAnimalStore((s) => s.fetchAnimals);
  const setFilters = useAnimalStore((s) => s.setFilters);

  const [species, setSpecies] = useState('');
  const [size, setSize] = useState('');
  const [ageRange, setAgeRange] = useState('');

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (species) filters.species = species;
    if (size) filters.size = size;
    if (ageRange) filters.age_range = ageRange;
    setFilters(filters);
    void fetchAnimals(filters);
  }, [species, size, ageRange, fetchAnimals, setFilters]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Animales en adopción</h1>
      <p className="mt-2 text-stone-500">Encuentra a tu próximo compañero de vida</p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-3">
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-700"
        >
          {speciesOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-700"
        >
          {sizeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-700"
        >
          {ageOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-stone-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-100 rounded w-2/3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {animals.length === 0 && (
            <EmptyState message="No se encontraron animales con estos filtros." />
          )}
          {animals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  );
}
