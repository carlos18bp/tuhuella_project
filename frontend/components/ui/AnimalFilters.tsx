'use client';

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

interface AnimalFiltersProps {
  species: string;
  size: string;
  ageRange: string;
  onSpeciesChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onAgeRangeChange: (value: string) => void;
}

export default function AnimalFilters({
  species,
  size,
  ageRange,
  onSpeciesChange,
  onSizeChange,
  onAgeRangeChange,
}: AnimalFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={species}
        onChange={(e) => onSpeciesChange(e.target.value)}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-700 shadow-sm hover:border-stone-300 transition-all duration-200"
      >
        {speciesOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={size}
        onChange={(e) => onSizeChange(e.target.value)}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-700 shadow-sm hover:border-stone-300 transition-all duration-200"
      >
        {sizeOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={ageRange}
        onChange={(e) => onAgeRangeChange(e.target.value)}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-700 shadow-sm hover:border-stone-300 transition-all duration-200"
      >
        {ageOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
