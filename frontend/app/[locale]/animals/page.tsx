'use client';

import { useEffect, useState } from 'react';

import { useAnimalStore } from '@/lib/stores/animalStore';
import { AnimalCard, EmptyState, MultiSelectDropdown, FAQAccordion } from '@/components/ui';
import type { MultiSelectOption } from '@/components/ui/MultiSelectDropdown';
import { animalsFaqs } from '@/lib/data/faqs';

const speciesOptions: MultiSelectOption[] = [
  { value: 'dog', label: 'Perros' },
  { value: 'cat', label: 'Gatos' },
  { value: 'other', label: 'Otros' },
];

const sizeOptions: MultiSelectOption[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];

const ageOptions: MultiSelectOption[] = [
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

  const [species, setSpecies] = useState<string[]>([]);
  const [size, setSize] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<string[]>([]);

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (species.length > 0) filters.species = species.join(',');
    if (size.length > 0) filters.size = size.join(',');
    if (ageRange.length > 0) filters.age_range = ageRange.join(',');
    setFilters(filters);
    void fetchAnimals(filters);
  }, [species, size, ageRange, fetchAnimals, setFilters]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-800">Animales en adopción</h1>
      <p className="mt-2 text-stone-500">Encuentra a tu próximo compañero de vida</p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-3">
        <MultiSelectDropdown
          label="Especies"
          options={speciesOptions}
          selected={species}
          onChange={setSpecies}
        />
        <MultiSelectDropdown
          label="Tamaño"
          options={sizeOptions}
          selected={size}
          onChange={setSize}
        />
        <MultiSelectDropdown
          label="Edad"
          options={ageOptions}
          selected={ageRange}
          onChange={setAgeRange}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
              <div className="aspect-[4/3] animate-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 animate-shimmer rounded w-2/3" />
                <div className="h-3 animate-shimmer rounded w-1/2" />
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

      <FAQAccordion
        items={animalsFaqs}
        title="Preguntas frecuentes sobre adopción"
        subtitle="Resolvemos tus dudas más comunes"
      />
    </div>
  );
}
